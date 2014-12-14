'use strict';

// ## dependencies
//
var Parth = require('parth');
var util = require('./lib/util');

// ## exports
//
exports = module.exports = Manifold;

// # Manifold constructor
//
// arguments
//  - `opt` type `Object` optional,
//     defaults to { name : '#rootNode' }
//
// returns
//  - manifold instance
//
function Manifold(opt){

  if(!(this instanceof Manifold)){
    return new Manifold(opt);
  }

  opt = opt || { };
  var parth = new Parth();

  util.merge(this, {
    method: { boil:{ }, parse:{ } },
    cache: util.merge(parth.cache, {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    })
  });

  this.boil('#get', parth.get);

  this.parse('#set', function(node, stems, opt){
    parth.set.call(this, stems, opt);
    return this;
  });

  this.parse('aliases',
    function parseAliases(node, stems, aliases){
      aliases = this.boil('aliases')(aliases);
      if(!aliases.length){  return ;  }
      this.cache.aliases = this.cache.aliases || { };
      aliases.forEach(function(alias){
        this.cache.aliases[alias] = util.fold(stems.join(' '))
          || this.cache.name;
      }, this);
      this.parse('completion')(this.cache, stems, aliases);
    });

  if(opt.completion !== null){
    this.parse('completion',
      function parseCompletion(node, stem, completion){
        completion = this.boil('completion')(completion || stem);
        if(!completion.length){  return ;  }
        node.completion = node.completion || [ ];
        completion.forEach(function(name){
          if(node.completion.indexOf(name) < 0){
            node.completion.push(name);
          }
        });
      });
  }

}

// ## Manifold.set
// > premise: set relaxed, get fast
//
// arguments
//  - `stems` types `string`, `array`, `function` or `object`
//  - optional: `o` types `object` or `function`
//
// return `this`
//

Manifold.prototype.set = function(stems, o){
  var stemsIs = util.type(stems);
  if( !stemsIs.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     '> stems should be: `string`, `array`, `function` or `object`');
  }

  var node = this.cache, parent = this.cache;
  var parsers = Object.keys(this.method.parse);

  var oIs = util.type(o);
  o = oIs.plainObject || stemsIs.plainObject || { };
  o.handle = stemsIs.function || oIs.function
    || util.type(o.handle).function;

  if(stemsIs.array){
    o.aliases = stems.slice(1);
    stems = stems[0];
  }

  var self = this;
  stems = this.boil('#set')(stems);
  stems.forEach(function createChildren(stem, index){
    var path;
    // ensure node existence
    if(!node.children){ node.children = { }; }
    if(!node.children[stem]){
      path = stems.slice(0, index).join(' ') || '';
      node.children[stem] = {
        path: util.fold(path + ' ' + stem),
        depth: node.depth + 1,
        parent: util.fold(path) || self.cache.name
      };
    }
    // keep parent to parse #set o,
    // go next node and parse child props
    parent = node;
    node = node.children[stem];
    parsers.forEach(function(prop){
      self.parse(prop)(parent, stem.substring(0));
    });
  });

  // process props of last node from its parent using options
  Object.keys(o).forEach(function parseProps(prop){
    var value = util.clone(o[prop], true);
    if(value === void 0){ return ; }
    if(value === null){ delete node[prop]; }
    if(self.method.parse[prop]){
      self.parse(prop)(parent, stems.slice(), value);
    } else if(util.type(value).plainObject){
      node[prop] = node[prop] || { };
      util.merge(node[prop], value);
    } else { node[prop] = value; }
  });

  // wipe & return
  stemsIs = oIs = parsers = null;
  return this.parse('#set')(node, stems, o);
};

// ## Manifold.boil
// > premise: transform input to an array
// > have all extra information on opts
//
// arguments
//  - `prop` type `string`
//  - `boiler` type `function` optional
//
// return
//  - `boiler` function if arguments < 2
//  - `this` otherwise
//
Manifold.prototype.get = function(stems, o){
  var boil = this.boil('#get');
  var stem, index = 0, found = this.cache;
  o = util.type(o || stems).plainObject || { };

  stems = boil(stems, o);
  // aliases should be only on the rootNode
  if(found.aliases && found.aliases[o.path]){
    stems = boil(found.aliases[o.path], o);
  }

  // for the rest
  while((stem = stems[index])){
    if(found.children && found.children[stem]){
      index++; found = found.children[stem];
    } else { index = -1; }
  }

  // wipe, copy & return
  var node;
  if(!o.ref){
    node = util.merge({}, found);
    delete node.children;
    node = util.clone(node, true);
  }

  index = stem = null;
  return this.parse('#get')(node || found, stems, o);
};

// ## Manifold.boil
// > premise: transform input to an array
// > have all extra information on opts
//
// arguments
//  - `prop` type `string`
//  - `boiler` type `function` optional
//
// return
//  - `boiler` function if arguments < 2
//  - `this` otherwise
//
Manifold.prototype.boil = function(prop, boiler){
  if(arguments.length < 2){
    return this.method.boil[prop] || util.boil;
  }

  if(typeof prop !== 'string' && typeof boiler !== 'function'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.boil(prop[, boiler]):\n' +
      ' > `prop` should be a string and, if given, `boiler` a function');
  }

  var self = this;
  this.method.boil[prop] = function(stems, o){
    stems = boiler.call(self, stems, o);
    if(!stems){ return [ ]; }
    stems = util.type(stems.argv || stems.path || stems);
    if(stems.array){ return stems.array; }
    if(stems.string){ return util.boil(stems.string, o); }
    throw new TypeError(
      ' While boiling `'+prop+'` with boiler(stems, opts):\n'+
      ' > a boiler should return:\n' +
      '  - a string\n - an array\n'+
      '  - an object with a `path` or `argv` property');
  };

  return this;
};

// ## Manifold.parse
// > premise: output to object with given opts props
//
// arguments
//  - `prop` type `string`
//  - `parser` type `function` optional
//
// return
//  - `parser` function if arguments < 2
//  - `this` otherwise
//
util.parse = function(node, opt){ // the default
  opt = opt || { }; return util.merge(node, opt);
};

Manifold.prototype.parse = function(prop, parser){
  if(arguments.length < 2){
    return this.method.parse[prop] || util.parse;
  }

  if(typeof prop !== 'string' && typeof boiler !== 'function'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.parse(prop[, parser]):\n' +
      ' > `prop` should be a string and, if given, `parser` a function');
  }

  var self = this;
  this.method.parse[prop] = function(/* arguments */){
    var parsed = parser.apply(self, arguments);
    if(!parsed){ return { }; }
    if(util.type(parsed).object){ return parsed; }
    throw new util.Error(
      ' While parsing `'+prop+'` \n'+
      ' parser.apply(self, arguments):\n'+
      ' > a parser should return an `object` or a falsy value');
  };

  return this;
};
