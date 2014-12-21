'use strict';

// ## dependencies
//
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

  util.Parth.call(this);

  util.merge(this, {
    method: { boil:{ }, parse:{ } },
    store: util.merge(this.store, {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    })
  });

  // ## main boilers and parsers
  //

  this.boil('#get', util.Parth.prototype.get);
  this.parse('#set', util.Parth.prototype.set);
  this.parse('#get', function(node, stems, opt){
    if(!opt || opt.ref){ return node; }
    return util.merge(node, {
      url: this.parse('#get.url')(opt.url),
      params: opt.params,
      notFound: opt.notFound
    });
  });

  // ## sample parsers
  //

  this.parse('aliases', function parseAliases(node, stems, aliases){
    aliases = this.boil('aliases')(aliases);
    if(!aliases){  return ;  }
    this.store.aliases = this.store.aliases || { };
    aliases.forEach(function(alias){
      this.store.aliases[alias] = util.fold(stems.join(' '))
        || this.store.name;
    }, this);
    this.parse('completion')(this.store, stems, aliases);
  });

  if(opt.completion){
    this.parse('completion', function parseCompletion(node, stem, completion){
      completion = this.boil('completion')(completion || stem);
      if(!completion){  return ;  }
      node.completion = node.completion || [ ];
      completion.forEach(function(name){
        if(node.completion.indexOf(name) < 0){
          node.completion.push(name);
        }
      });
    });
  }

}
util.inherits(Manifold, util.Parth);

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
    var boiled = boiler.call(self, stems, (o = o || {}));
    if(!boiled){ return [ ]; }
    boiled = util.type(boiled.argv || boiled);
    if(boiled.array){ return boiled.array.concat(); }
    throw new TypeError(
      ' While boiling `'+prop+'` with boiler(stems, opts):\n'+
      ' > a boiler should return an `array` or `falsy`');
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
util.parse = function(node){ return node; };

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
      ' > a parser should return an `object` or `falsy`');
  };

  return this;
};

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

  var oIs = util.type(o);
  o = oIs.plainObject || stemsIs.plainObject || { };
  o.handle = stemsIs.function || oIs.function
    || util.type(o.handle).function;

  if(stemsIs.array){
    o.aliases = stems.slice(1);
    stems = stems[0];
  }

  var self = this;
  var node = this.store, parent = this.store;
  var parsers = Object.keys(this.method.parse);

  stems = this.boil('#set')(stems);
  stems.forEach(function createChildren(stem, index){
    // ensure node existence
    if(!node.children){ node.children = { }; }
    if(!node.children[stem]){
      node.children[stem] = {
        path: self.parse('#set')(stems.slice(0, index+1)).path,
        depth: node.depth + 1,
        parent: node.path || self.store.name
      };
    }
    // keep parent to parse #set o,
    // go next node and parse child props
    parent = node; node = node.children[stem];
    parsers.forEach(function(prop){
      self.parse(prop)(parent, stem.substring(0));
    });
  });

  // props of last node from its parent using options
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

  return this;
};

// ## Manifold.get(stems[, o])
// > take a string or array, return the matching object
//
// arguments
//  - `stems` type `string` or `array`
//  - `o` type `object` optional holding all extra information
//
// return node `found`
// --
// api.public
// --
//
Manifold.prototype.get = function(stems, o){
  o = util.type(o || stems).plainObject || { };
  var stem, index = 0, found = this.store;
  var boil = this.boil('#get');

  // aliases should only be only at the rootNode
  stems = boil(stems, o);
  if(found.aliases && found.aliases[o.path]){
    o.path = found.aliases[o.path];
    if(found.cache[o.path]){
      stems = found.cache[o.path].regex.argv;
    } else { stems = boil(o.path, o); }
  }

  while(index > -1){ // fallback always
    stem = stems[index];
    if(found.children && found.children[stem]){
      found = found.children[stem]; index++;
    } else { index = -1; }
  }

  var node;
  if(!o.ref){ // pass reference?
    node = util.merge({}, found);
    delete node.children;
    node = util.clone(node, true);
  }

  return this.parse('#get')(node || found, stems, o);
};
