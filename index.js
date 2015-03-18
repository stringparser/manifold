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
  if(pis.function || ois.function){
    o.handle = pis.function || ois.function;
  }

  var node = this.store;
  var stem = this.add(path || o.path);

  if(stem && this.regex.length > 1){

    node = this.store.children;
    var master = this.regex.master;
    var group = master.source.match(/\(+\^.*?\)+(?=\||$)/g);

    this.regex.forEach(function(re, index, regex){
      var found = util.exclude(group[index], master).exec(re.path);
      if(!found){ return ; }
      found = regex[found.indexOf(found.shift())];
      var child = node[re.path];
      var parent = node[found.path];

      util.defineProperty(parent, 'children', 'w', {});
      if(!parent.children[child.path]){
        parent.children[child.path] = child;
      }

      util.defineProperty(child, 'parent', 'w', {depth: 0});
      if(child.parent.depth < re.depth){
        child.parent = parent;
      }
    });

    node = node[stem.path];
  }

  Object.keys(o).forEach(function(key){
    var value = util.clone(o[key], true);
    if(value === null){ delete node[key]; }
    else if(this.parses && this.parses[key]){
      this.parses[key].call(this, node, value, o);
    } else if(util.type(value).plainObject){
      if(!node[key]){ node[key] = {}; }
      util.merge(node[key], value);
    } else {
      node[key] = value;
    }
  }, this);

  return this;
};

// ## manifold.get(path[, options])
// > string maching a regexp to find an object
//
// arguments
//  - `path` type string
//  - `options` type object with all extra information
//
// returns the object `node` found
//
Manifold.prototype.get = function(path, o){
  o = util.type(o || path).match(/plainObject|function/) || {};

  var stem = this.match(path, o);
  var found = stem ? this.store.children[stem.path] : this.store;
  if(stem === null){ o.notFound = false; }
  if(o.ref){ return found; }

  util.merge(o, util.omit(found, 'parent', 'regex'));

  return util.clone(o, true);
};

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
  if(!parser && this.parses){
    return this.parses[prop] || util.parse;
  } else if(typeof prop !== 'string'){
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
