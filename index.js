'use strict';

var util = require('./lib/util');

//
// ## exports
//

exports = module.exports = Hie;

//
// ## Hie.set
//

Hie.prototype.set = function(stems, opts){
  var stemsIs = util.type(stems);
  if( !stemsIs.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     'should have at least one argument being: \n'+
     '  a `string`, an `array`, a function or an object'
   );
  }

  var optsIs = util.type(opts);
  opts = optsIs.plainObject || stemsIs.plainObject || {
    handle: optsIs.function || stemsIs.function
  };

  if(stemsIs.array){
    opts.aliases = stems.slice(1);
    stems = stems[0];
  }
  stems = this.boil('set', stems);
  stemsIs = optsIs = null; //wipe

  var node = this.cache, parent = this.cache;
  stems.forEach(function createChildren(stem, index){
    node.children = node.children || { };
    if(stem && !node.children[stem]){
      node.children[stem] = {
        name: stem,
        depth: node.depth + 1,
        parent: ((node.parent || '') + ' ' + node.name).trim()
      };
    }
    node.completion = node.completion || [ ];
    if(node.completion.indexOf(stem) < 0){
      node.completion.push(stem);
    }
    node = node.chilren[stem];
    if(stems[index+1]){ parent = node; }
  });

  var parse = this.parse.method;
  Object.keys(opts).forEach(function parseProps(prop){
    var value = opts[prop];
    if(value === void 0){ return ; }
    if(value === null){ return delete node[prop]; }

    node[prop] = node[prop] || { };

    if(parse[prop]){
      parse[prop].call(this, parent, stems, value);
    } else if(util.type(value).plainObject){
      util.merge(node[prop], util.clone(value, true));
    } else {
      node[prop] = util.clone(value);
    }
  }, this);

  return this;
};

//
// ## Hie.get
//

Hie.prototype.get = function(stems){
  var boil = this.boil('get');
  var stem, index = 0, found = this.cache;

  stems = boil(stems);
  while(stems[index]){
    stem = stems[index];
    if(found.aliases && found.aliases[stem]){
      stems = stems.join(' ').replace(stem, found.aliases[stem]);
      stems = boil(stems); stem = stems[index];
    }
    if(found.children && found.children[stem]){
      index++; found = found.children[stem];
    } else { index = -1; }
  }

  var shallow = util.merge({ }, found);
  stem = null; // wipe
  return shallow;
};

//
// ## Hie.boil
//

Hie.prototype.boil = function(name, stems_, regexp_){
  if(typeof this[name] !== 'function'){
    throw new Error(
      'boil(method[, boiler, regexp]):\n > no method `'+name+'` at `this`');
  }

  var boiler = null, self = null;
  if(util.type(stems_).function){
    self = this; boiler = stems_;
    this.boil.method[name] = function(stems, regex){
      regex = util.type(regex).regexp || /[ ]+/;
      stems = boiler.call(self, util.type(stems), regex);
      if(util.type(stems).array){ return stems; }
      throw new util.Error(
        'boil(method, boiler[, regexp]):\n > boiler should return an array');
    };
    return this;
  }

  boiler = this.boil.method[name] || util.boil;
  if(stems_){ return boiler(stems_, regexp_); }
  return boiler;
};

//
// ## Hie.parse
//

Hie.prototype.parse = function(prop, parser){

  if(!parser){
    return this.parser.method[prop] || util.parser;
  }

  if(typeof prop !== 'string'){
    throw new util.Error(
      'parse(prop[, parser]):\n > `prop` should be a string');
  }
  if(typeof parser !== 'function'){
    throw new util.Error(
      'parse(prop[, parser]):\n > If given, `parser` should be a function');
  }

  this.parser.method[prop] = parser;

  return this;
};

//
// ## Hie.prototype.constructor
//

function Hie(opt){
  opt = opt || { };
  if( !(this instanceof Hie) ){
    return new Hie(opt);
  }

  Object.defineProperty(this, 'cache', {
    writable: true,
    enumerable: false,
    configurable: false,
    value: {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    }
  });

  this.boil.method = { };
  this.parse.method = { };

  //
  // #### parse `handle` props
  //

  this.parse('aliases', function (node, stems, aliases){
    aliases = this.boil('set', aliases);
    if(!aliases.length){  return this;  }

    node.aliases = node.aliases || { };
    node.completion = node.completion || [ ];
    aliases.forEach(function(alias){
      node.aliases[alias] = stems.join(' ');
      if(node.completion.indexOf(alias) < 0){
        node.completion.push(alias);
      }
    });
  });

  //
  // #### parse `handle` props
  //

  this.parse('handle', function (node, stems, handle){
    var len = stems.length;
    if(len){  node.children[stems[len-1]].handle = handle;  }
      else {  node.handle = handle;  }
  });

  //
  // #### parse `completion` props
  //

  this.parse('completion', function (node, stems, completion){
    completion = util.boil('set', completion);
    if(!completion.length){  return this;  }
    completion.forEach(function(name){
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(name) < 0){
        node.completion.push(name);
      }
    });
  });
}
