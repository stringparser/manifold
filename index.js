'use strict';

var util = require('./lib/util');

//
// ## exports
//

exports = module.exports = Hie;

//
// ## Hie.prototype.constructor
//

function Hie(opt){
  opt = opt || { };

  if(!(this instanceof Hie)){ return new Hie(opt); }

  // ## Hie.method
  this.method = {boil: { }, parse: { }};

  // ## Hie.cache
  Object.defineProperty(this, 'cache', {
    writable: true,
    enumerable: false,
    configurable: false,
    value: {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    }
  });

  // #### parse `children` props
  this.parse('children', function(node, stems, stem){
    node.children = node.children || { };
    node.children[stem] = node.children[stem] || {
      name: stem,
      depth: node.depth + 1,
      parent: ((node.parent || '') + ' ' + node.name).trim()
    };
  });

  // #### parse `handle` props
  this.parse('handle', function (node, stems, handle){
    var len = stems.length;
    if(len){  node.children[stems[len-1]].handle = handle;  }
      else {  node.handle = handle;  }
  });

  // #### parse `completion` props
  this.parse('completion', function (node, stems, completion){
    completion = this.boil('completion', completion);
    if(!completion.length){  return null;  }
    completion.forEach(function(name){
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(name) < 0){
        node.completion.push(name);
      }
    });
  });

  // #### parse `aliases` props
  this.parse('aliases', function (node, stems, aliases){
    aliases = this.boil('aliases', aliases);
    if(!aliases.length){  return null;  }
    node.aliases = node.aliases || { };
    node.completion = node.completion || [ ];
    aliases.forEach(function(alias){
      node.aliases[alias] = stems.join(' ');
      if(node.completion.indexOf(alias) < 0){
        node.completion.push(alias);
      }
    });
  });
}

//
// ## Hie.boil
//

Hie.prototype.boil = function(prop, stems_, regexp_){
  var self = null, boiler = null;

  if(this[prop]){ prop = '#' + prop; }
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
  var stemsIs = util.type(stems);
  if( !stemsIs.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     'stems should have type: \n'+
     '  `string`, `array`, `function` or `object`'
   );
  }

  var optsIs = util.type(opts);
  opts = optsIs.plainObject || stemsIs.plainObject || { };
  opts.handle = optsIs.function || stemsIs.function;

  if(!opts.handle){ delete opts.handle; }
  if(stemsIs.array){
    opts.aliases = stems.slice(1); stems = stems[0];
    if(!opts.aliases){ delete opts.aliases; }
  }

  stems = this.boil('#set', stems);
  var node = this.cache, parent = this.cache;
  stems.forEach(function createChildren(stem){
    this.parse('children').call(this, node, stems, stem);
    this.parse('completion').call(this, node, stems, stem);
    parent = node; node = node.chilren[stem];
  }, this);

  Object.keys(opts).forEach(function parseProps(prop){
    var value = opts[prop];
    if(value === null){ return delete node[prop]; }
    if(value === void 0){ return ; }

    if(this.method.parse[prop]){
      this.parse(prop).call(this, parent, stems, value);
    } else {
      this.parse('#set').call(this, node, prop, value);
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
  return this.parse('#get', shallow);
};
