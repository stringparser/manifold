'use strict';

var util = require('./lib/util');

exports = module.exports = Manifold;

/*
  ## module.exports
*/
function Manifold(){
  if(!(this instanceof Manifold)){
    return new Manifold();
  }

  this.parses = {};
  util.Parth.call(this);
  this.parse(util.defaultParsers.prop);
  util.defineProperty(this.store, 'children', '', {});
}
util.inherits(Manifold, util.Parth);

/* ### manifold.parse(prop[, parser])
> parse `node` properties _before_ they are set

The method sets a parser for latter usage in
[`manifold.set([path, props]`](#manifoldsetpath-props).
The parser function will be invoked when  `props`
of that #set method has a property named `prop`.

_arguments_
 - `prop`, type string or object with one function per key
 - `parser`, optional, type `function`

_returns_
 - `parser` for less than two arguments
 - `this` for two arguments
*/
Manifold.prototype.parse = function(prop, parser){
  var propType = util.type(prop);
  if(propType.plainObject && !parser){
    return Object.keys(prop).forEach(function(key){
      return this.parse(key, prop[key]);
    }, this);
  }

  if(!parser && this.parses){
    return prop ? this.parses[prop] : util.parse;
  } else if(!propType.string){
    throw new TypeError('parse(prop[, parser])\n'+
      ' `prop` should be a string');
  } else if(typeof parser !== 'function'){
    throw new TypeError('parse(prop, parser):\n'+
      ' `parser`, if given, should be a function');
  }

  var self = this;
  this.parses[prop] = function propParser(/* arguments */){
    return parser.apply(self, arguments);
  };

  return this;
};

/* ## manifold.set([path, props])
> set a path to regex mapping for an object

_arguments_
- `path` type string
- `props` type function or plainObject
 - when is a function it will be assigned to the `options.handle`
 - when is a plainObject, all option properties
   are passed first to a `parser` if there is one and if not,
  that property is cloned and assigned to the node props

_returns_ this

The path is taken as a regular expression
using the [parth](http://github.com/stringparser/parth) module,
which uses the usual conventions on for path to regexp parsing.
So you know... interesting things can happen.
*/

Manifold.prototype.set = function(path, opt){
  if(!util.type(path).match(/string|function|plainObject/)){
    throw new TypeError('set(path/options [, options]). '+
      'Unsupported type for path/options.\n\n'+
      'Supported types are:\n'+
      ' - string (path)\n' +
      ' - plainObject (options)\n'
    );
  }

  var oType = util.type(opt || path);
  var o = oType.plainObject || '';
  if(oType.function || util.type(o.handle).function){
    o = o || {};
    o.handle = oType.function || o.handle;
  }

  var node = this.store;
  var stem = util.boil(path || o.path);
  if(stem && !node.children[stem.path]){
    this.add(stem.path);
    node = node.children[stem.path];
    util.defineProperty(node, 'parent', 'w', this.store);
    util.defineProperty(node, 'children', 'w');
  } else if(stem){
    node = node.children[stem.path];
  }

  if(!o){ return this; }
  Object.keys(o).forEach(function parseOptions(key){
    var value = o[key];
    if(value === null){ delete node[key]; }
    else if(this.parses[key]){
      return this.parses[key](node, value, o);
    } else if(util.type(value).plainObject){
      if(!node[key]){ node[key] = {}; }
      util.merge(node[key], util.clone(value, true));
    } else {
      node[key] = util.clone(value, true);
    }
  }, this);

  return this;
};

/*
## manifold.get([path, options, mod])
> get an object matching the given path, clone it if necessary

_arguments_
 - `path`, optional, type string
 - `options`, optional, type object with all extra information
 - `mod`, type object. If is a:
   - plainObject with property ref, the node found will not be cloned
   - regular expression, are the props to skip while cloning

_returns_ the object (cloned/by reference) `node` found

In addition, if the node has a parent it will inherit its
properties while cloning.

*/

var skipRE = /children|parent/;

Manifold.prototype.get = function(path, opt, mod){
  var o = util.type(opt || path).object || {};
  mod = mod || o;

  var node = this.store;
  var stem = this.match(path, o);

  if(stem){ node = node.children[stem.path]; }
  if(mod && mod.ref){ return node; }

  function whilst(){
    Object.keys(node).forEach(function(key){
      if(skipRE.test(key) || o[key] !== void 0){ return ; }
      o[key] = util.clone(node[key], true);
    });

    if(node.parent && node !== node.parent){
      node = node.parent;
      whilst();
    }
  }

  whilst();

  return o;
};
