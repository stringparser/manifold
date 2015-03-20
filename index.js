'use strict';

var util = require('./lib/util');

exports = module.exports = Manifold;

// # Manifold constructor
//
function Manifold(){
  if(this instanceof Manifold){
    return util.Parth.call(this);
  }
  return new Manifold();
}
util.inherits(Manifold, util.Parth);

// ## manifold.parse(prop[, parser])
// > parse properties before they are set
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
  if(!this.parses){ this.parses = {}; }
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
    throw new TypeError('set(path/options [, options]) '+
      '`path/options`, should be:' +
      ' - string (path)  ' +
      ' - function or plainObject (options)'
    );
  }

  o = ois.plainObject || pis.plainObject || {};
  var handle = pis.function || ois.function;
  if(handle){ o.handle = handle; }

  var node = this.store;
  var stem = this.add(path || o.path);

  if(stem){ node = node.children[stem.path]; }
  Object.keys(o).forEach(function(key){
    var value = util.clone(o[key], true);
    if(value === null){ delete node[key]; }
    else if(this.parses && this.parses[key]){
      this.parses[key](node, value, o);
    } else if(util.type(value).plainObject){
      if(!node.hasOwnProperty(key)){ node[key] = {}; }
      util.merge(node[key], value);
    } else { node[key] = value; }
  }, this);

  return this;
};

// ## manifold.get(path[, options])
// > get object maching the given path
//
// arguments
//  - `path` type string
//  - `options` type object with all extra information
//
// returns the object `node` found
//

Manifold.prototype.get = function(path, o){
  o = util.type(o || path).match(/plainObject|function/) || {};

  var node = this.store;
  var stem = this.match(path, o);
  if(stem){ node = node.children[stem.path]; }

  if(o.ref){ return node; }

  return util.merge(o, util.clone(node, true));
};

// ## manifold.fold(path[, options])
// > get object maching the given path, inherit from its parent(s)
//
// arguments
//  - `path` type string
//  - `options` type object with all extra information
//
// returns the object `node` found
//

Manifold.prototype.fold = function(path, o){
  o = util.type(o || path).match(/plainObject|function/) || {};
  var node = this.get(path, o);
  if(o.ref){ return node; }

  var skip = util.type(o.skip).regex || /children|parent/;

  while(node){
    for(var key in node){
      if(skip.test(key) || util.has(o, key)){ continue; }
      o[key] = util.clone(node[key], true);
    }

    if(node.parent && node.parent.depth < node.depth){
      node = node.parent;
      if(o.ref){ o.parent = node; }
    } else if(node){ node = null; }
  }

  return o;
};
