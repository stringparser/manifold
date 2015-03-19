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

  o = ois.plainObject || pis.plainObject;
  var handle = pis.function || ois.function;
  if(handle){ o = o || {}; o.handle = handle; }

  var node = this.store;
  var stem = util.boil(path || o ? o.path : null);

  if(stem && !node[stem.path]){
    this.add(stem.path);
    var master = this.regex.master;
    var group = master.source.match(/\(+\^.*?\)+(?=\||$)/g);

    this.regex.forEach(function(re, index, regex){
      var found = util.exclude(group[index], master).exec(re.path);
      if(!found){ return ; }

      found = regex[found.indexOf(found.shift())];
      var child = node.children[re.path];
      var parent = node.children[found.path];

      util.defineProperty(parent, 'children', 'w', {});
      if(!parent.children[child.path]){
        parent.children[child.path] = child;
      }

      util.defineProperty(child, 'parent', 'w', parent);
      if(child.parent.regex.depth < re.depth){
        child.parent = parent;
      }
    });
  }

  if(!o){ return this; }
  if(stem){ node = node.children[stem.path]; }
  Object.keys(o).forEach(function(key){
    var value = util.clone(o[key], true);
    if(value === null){ delete node[key]; }
    else if(this.parses && this.parses[key]){
      this.parses[key](node, value, o);
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

  var found = this.store;
  var stem = this.match(path, o);
  if(stem){ found = found.children[stem.path]; }
  if(o.ref){ return found; }

  while(found){
    for(var key in found){
      if(o.hasOwnProperty(key)){ continue; }
      o[key] = util.clone(found[key], true);
    }

    if(found.parent && found.parent.depth < found.depth){
      found = found.parent;
    } else if(found){ found = null; }
  }

  return o;
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
  if(util.type(prop).plainObject){
    Object.keys(prop).forEach(function(key){
      return this.parse(key, prop[key]);
    }, this);
    return this;
  }

  if(!parser && this.parses){
    return prop ? this.parses[prop] : util.parse;
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
