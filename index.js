'use strict';

var util = require('./lib/util');

exports = module.exports = Manifold;

// # Manifold constructor
//
function Manifold(){
  if(!(this instanceof Manifold)){
    return new Manifold();
  }

  this.parses = {};
  this.parse(util.defaultParsers);

  util.Parth.call(this);
  // > just to make logging pretty
  Object.defineProperty(this, 'regex', {
    enumerable: false,
    value: this.regex
  });

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

  o = ois.plainObject || pis.plainObject || '';
  var handle = pis.function || ois.function;
  if(handle){ o = o || {}; o.handle = handle; }

  var node = this.store;
  var stem = this.add(path || o.path);

  if(stem){
    node = node.children[stem.path];
    util.defineProperty(node, 'parent', 'w', null);
    util.defineProperty(node, 'children', 'w', null);
  } // make sure parent and children are always defined

  if(!o){ return this; }
  Object.keys(o).forEach(function(key){
    var value = o[key];
    if(value === null){ delete node[key]; }
    else if(this.parses[key]){
      return this.parses[key](node, value, key, o);
    }

    value = util.clone(value, true);
    if(util.type(value).plainObject){
      if(!node.hasOwnProperty(key)){
        node[key] = {};
      }
      util.merge(node[key], value);
    } else { node[key] = value; }
  }, this);

  return this;
};

// ## manifold.get([path, options, skip])
// > get object maching the given path
//
// arguments
//  - `path` type string
//  - `options` type object with all extra information
//  - `skip/ref` when type is
//    - regexp -> property names to skip from parent
//    - boolean -> ref, return node reference
//
// returns the object `node` found
//

var skipRE = /children|parent|regex/;

Manifold.prototype.get = function(path, o, s){
  s = util.type(s || o).regexp || skipRE;
  o = util.type(o || path).object || {};

  var node = this.store;
  var stem = this.match(path, o);
  if(stem){ node = node.children[stem.path]; }
  if(o.ref){ return node; }

  while(node){
    for(var key in node){
      if(util.has(o, key) || s.test(key)){ continue; }
      o[key] = util.clone(node[key], true);
    }

    if(node.parent && node.path !== node.parent.path){
      node = node.parent;
    } else if(node){ node = null; }
  }

  return o;
};
