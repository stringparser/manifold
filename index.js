'use strict';

var util = require('./lib/util');

exports = module.exports = Manifold;

// # module.exports
//
function Manifold(){
  if(!(this instanceof Manifold)){
    return new Manifold();
  }

  this.parses = {};
  this.parse(util.defaultParsers);
  util.Parth.call(this);
}
util.inherits(Manifold, util.Parth);

// ## manifold.parse(prop[, parser])
// > parse node properties before they are set
//
// arguments
//  - prop, type `string` or `object` with all parsers
//  - parser, optional, type `function`
//
// returns
//  - parser for less than two arguments
//  - this for two arguments
//
Manifold.prototype.parse = function(prop, parser){
  var propis = util.type(prop);
  if(propis.plainObject){
    return Object.keys(prop).forEach(function(key){
      return this.parse(key, prop[key]);
    }, this);
  }

  if(!parser && this.parses){
    return prop ? this.parses[prop] : util.parse;
  } else if(!propis.string){
    throw new TypeError('parse(prop[, parser])\n'+
      ' `prop` should be a string');
  } else if(typeof parser !== 'function'){
    throw new TypeError('parse(prop, parser):\n'+
      ' `parser`, if given, should be a function');
  }

  var self = this;
  this.parses[prop] = function(/* arguments */){
    return parser.apply(self, arguments);
  };

  return this;
};

// ## manifold.set(path[, options])
// setup path hierachy via regexes
//
// arguments
//  - `path` type string, function or plainObject
//  - `options` type function or plainObject
//
// returns this
//
Manifold.prototype.set = function(path, o){
  var pis = util.type(path), ois = util.type(o);
  if(!pis.match(/string|function|plainObject/)){
    throw new TypeError('set(path/options [, options]). '+
      'Unsupported type for path/options.\n\n'+
      'Supported types are:\n'+
      ' - string (path)\n' +
      ' - plainObject (options)\n'
    );
  }

  o = ois.plainObject || pis.plainObject || '';
  var handle = pis.function || ois.function;
  if(handle){ o = o || {}; o.handle = handle; }

  var node = this.store;
  var stem = util.boil(path || o.path);
  if(stem && !node.children[stem.path]){
    this.add(stem.path);
    node = node.children[stem.path];
    util.defineProperty(node, 'regex', 'w');
    util.defineProperty(node, 'parent', 'w');
    util.defineProperty(node, 'children', 'w');
    // so these are not deep copied
  } else if(stem){
    node = node.children[stem.path];
  }

  if(!o){ return this; }
  Object.keys(o).forEach(function(key){
    var value = o[key];
    if(value === null){ delete node[key]; }
    else if(this.parses[key]){
      return this.parses[key](node, value, key, o);
    } else if(util.type(value).plainObject){
      if(!node[key]){ node[key] = {}; }
      util.merge(node[key], util.clone(value, true));
    } else { node[key] = util.clone(value, true); }
  }, this);

  return this;
};

// ## manifold.get([path, options, mod])
// > get object maching the given path, clone it if necessary
//
// arguments
//  - `path`, optional, type string
//  - `options`, optional, type object with all extra information
//  - `mod`, type object if is a
//    - regular expresion, props to skip while cloning found node
//    - plainObject with property ref, the node found will not be cloned
//
// returns the object `node` found
//
var skipRE = /children|parent|regex/;

Manifold.prototype.get = function(path, opt, mod){
  var o = util.type(opt || path).object || {};
  mod = mod || o;

  var stem = this.match(path, o);
  var node = this.store;

  if(stem){ node = node.children[stem.path]; }
  if(mod && mod.ref){ return node; }

  var skip = util.type(mod).regexp || skipRE;

  while(node){
    for(var key in node){
      if(skip.test(key) || util.has(o, key)){ continue; }
      o[key] = util.clone(node[key], true);
    }
    if(node !== node.parent){
      node = node.parent;
    }
  }

  return o;
};
