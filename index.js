'use strict';

var util = require('./lib/util');

//
// ## exports
//

exports = module.exports = Hie;

//
// ## Hie.boil
//

Hie.prototype.boil = function(prop, stems_, regexp_){
  var self = null, boiler = null;

  if(util.type(prop).string && util.type(stems_).function){
    self = this; boiler = stems_;
    this.method.boil[prop] = function(stems, regex){
      regex = util.type(regex).regexp || /[ ]+/;
      stems = boiler.call(self, util.type(stems), regex);
      if(util.type(stems).array){ return stems; }
      throw new util.Error(
        'boil(prop[, stems, regexp]):\n > boiler should return an array');
    };
    return this;
  }

  boiler = this.method.boil[prop] || util.boiler;
  if(stems_){ return boiler(stems_, regexp_); }
  return boiler;
};

//
// ## Hie.parse
//

Hie.prototype.parse = function(prop, parser){
  if(!util.type(parser).function){
    return this.method.parse[prop] || util.parser;
  }
  this.method.parse[prop] = parser;
  return this;
};

//
// ## Hie.set
//

Hie.prototype.set = function(stems, opts){

  stems = util.type(stems);
  if( !stems.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     'stems should have type: \n'+
     '  `string`, `array`, `function` or `object`'
   );
  }

  var optsIs = util.type(opts);
  opts = optsIs.plainObject || stems.plainObject || { };
  opts.handle = optsIs.function || stems.function;

  if(!opts.handle){ delete opts.handle; }
  if(stems.array){
    opts.aliases = stems.array.slice(1);
    stems.array = stems.array[0];
    if(!opts.aliases){ delete opts.aliases; }
  }

  stems = this.boil('#set')(stems.array || stems.string);
  var node = this.cache, parent = this.cache;
  stems.forEach(function createChildren(stem, index){
    node.children = node.children || { };
    if(!node.children[stem]){
      node.children[stem] = {
        name: stems.slice(0, index + 1).join(' '),
        depth: node.depth + 1,
        parent: node.depth > 1
          ? node.parent + ' ' + node.name
          : node.name
      };
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(stem) < 0){
        node.completion.push(stem);
      }
    }
    node = node.children[stem];
    if(stems[index+1]){ parent = node; }
  }, this);

  Object.keys(opts).forEach(function parseProps(prop){
    var value = opts[prop];
    if(value === void 0){ return ; }
    if(value === null){ return delete node[prop]; }
    if(this.method.parse[prop]){
      this.parse(prop)(parent, stems, value);
    } else {
      this.parse('#set')(node, prop, value);
    }
  }, this);

  return this;
};

//
// ## Hie.get
//

Hie.prototype.get = function(stems){
  var boil = this.boil('#get');
  var stem, index = 0, found = this.cache;

  stems = boil(stems);
  while(stems[index]){
    stem = stems[index];
    if(found.aliases && found.aliases[stem]){
      stems = boil( stems.join(' ').replace(stem, found.aliases[stem]) );
       stem = stems[index];
    }
    if(found.children && found.children[stem]){
      index++; found = found.children[stem];
    } else { index = -1;}
  } index = stem = null; // wipe

  var shallow = util.merge({ }, found);
  return this.parse('#get')(shallow);
};

//
// ## Hie.prototype.constructor
//

function Hie(opt){
  opt = opt || { };

  if(!(this instanceof Hie)){ return new Hie(opt); }

  function hie(stems, opts){
    return hie.set(stems, opts);
  }
  util.merge(hie, this);

  // ## Hie.cache
  Object.defineProperty(hie, 'cache', {
    writable: true,
    enumerable: false,
    configurable: false,
    value: {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    }
  });

  // ## Hie.method
  Object.defineProperty(hie, 'method', {
    writable: true,
    enumerable: false,
    configurable: false,
    value:{boil:{}, parse:{}}
  });

  // #### parse `handle` props
  hie.parse('handle', function (node, stems, handle){
    var len = stems.length;
    if(len){ node.children[stems[len-1]].handle = handle; }
      else { node.handle = handle; }
  });

  // #### parse `completion` props
  hie.parse('completion', function (node, stems, completion){
    completion = hie.boil('completion', completion);
    if(!completion.length){  return null;  }
    completion.forEach(function(name){
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(name) < 0){
        node.completion.push(name);
      }
    });
  });

  // #### parse `aliases` props
  hie.parse('aliases', function (node, stems, aliases){
    aliases = hie.boil('aliases', aliases);
    if(!aliases.length){  return null;  }
    var completion = [ ];
    node.aliases = hie.cache.aliases || { };
    aliases.forEach(function(alias){
      completion.push(alias);
      node.aliases[alias] = stems.join(' ');
    });
    hie.parse('completion', node, stems, completion);
  });

  return hie;
}
