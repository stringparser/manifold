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
//  - `opt` type `Object` optional, defaults to { name : '#rootNode' }
//  - `manifold` type `Manifold` optional, defaults to  { }
//
// returns
//  - manifold instance
//
function Manifold(opt, manifold_){

  if(!(this instanceof Manifold)){
    return new Manifold(opt, manifold_);
  }

  function manifold(stems, opts){
    return manifold.set(stems, opts);
  }
  util.merge(manifold, this);

  opt = opt || { };
  if(!(manifold_ instanceof Manifold)){ manifold_ = { }; }

  // ## manifold.cache
  manifold.cache = manifold_.cache || {
    name: util.type(opt.name).string || '#rootNode',
    depth: 0
  };

  // ## manifold.method
  manifold.method = {boil:{}, parse:{}, _: {boil:[], parse:[]}};

  // ### parse `aliases` props
  manifold.parse('aliases', function (node, stems, aliases){
    aliases = manifold.boil('aliases')(aliases);
    if(!aliases.length){  return null;  }
    var completion = [ ];
    this.cache.aliases = this.cache.aliases || { };
    aliases.forEach(function(alias){
      completion.push(alias);
      this.cache.aliases[alias] = stems.join(' ');
    }, this);
    this.parse('completion')(this.cache, stems, completion);
  });

  if(opt.completion === null){ return manifold; }

  // ### parse `completion` props
  manifold.parse('completion', function (node, stem, completion){
    if(arguments.length < 3){
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(stem) < 0){
        node.completion.push(stem);
      }
      return this;
    }
    completion = this.boil('completion')(completion);
    if(!completion.length){  return null;  }
    completion.forEach(function(name){
      node.completion = node.completion || [ ];
      if(node.completion.indexOf(name) < 0){
        node.completion.push(name);
      }
    });
    return this;
  });

  return manifold;
}

// ## Manifold.boil
// > premise: transform input to an array
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
  if(arguments.length < 2){ return this.method.boil[prop] || util.boiler; }
  if(typeof prop !== 'string'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.boil(prop[, boiler]):\n' +
      ' > `prop` should be a string and, if given, `boiler` a function');
  }
  // add it to the list of boilers
  if(!this.method.boil[prop]){ this.method._.boil.push(prop); }

  var self = this;
  this.method.boil[prop] = function(stems, opts){
    stems = util.boiler(stems, opts);
    stems = boiler.call(self, stems, opts);
    if(!stems){ return [ ]; }
    if(util.type(stems).array){ return stems; }
    throw new util.Error(
      ' While boiling `'+prop+'` with boiler(stems, opts):\n'+
      ' > a boiler should return an array');
  };

  return this;
};

// ## Manifold.parse
// > premise: transform output to an object
//
// arguments
// `prop` type `string`
// `parser` type `function` optional
//
// return
//  - `parser` function if arguments < 2
//  - `this` otherwise
//
Manifold.prototype.parse = function(prop, parser){

  if(arguments.length < 2){ return this.method.parse[prop] || util.parser; }
  if(typeof prop !== 'string'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.parse(prop[, parser]):\n' +
      ' > `prop` should be a string and, if given, `parser` a function');
  }
  // add it to the list of parsers
  if(!this.method.parse[prop]){ this.method._.parse.push(prop); }

  var self = this;
  this.method.parse[prop] = function(/* arguments */){
    var parsed = parser.apply(self, arguments);
    if(!parsed){ return self; }
    if(util.type(parsed).object){ return parsed; }
    throw new util.Error(
      ' While parsing `'+prop+'` \n'+
      ' parser.apply(self, arguments):\n'+
      ' > a parser should return an object');
  };

  return this;
};

// ## Manifold.set
// > premise: set relaxed get fast
//
// ### arguments
// `stems` type `string`
// `boiler` type `function` optional
//
// ### return
//  - `boiler` function if arguments < 2
//  - `this` otherwise
//
Manifold.prototype.set = function(stems_, opts_){
  var stems = util.type(stems_);
  if( !stems.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     '> stems should be: `string`, `array`, `function` or `object`');
  }

  var self = this;
  var node = this.cache, parent = this.cache;
  var parsers = this.method._.parse;

  var opts = util.type(opts_);

  opts = opts.plainObject || stems.plainObject || opts;
  opts.handle = stems.function || opts.function;

  stems = this.boil('#set')(stems.array || stems.string, opts);
  stems.forEach(function createChildren(stem, index){
    // ensure node existence
    if(!node.children){ node.children = { }; }
    if(!node.children[stem]){
      node.children[stem] = {
        name: stems.slice(0, index + 1).join(' '),
        depth: node.depth + 1,
        parent: node.depth > 1
          ? node.parent + ' ' + node.name
          : node.name
      };
    }
    // keep parent to parse #set opts,
    // go next node and parse child props
    parent = node;
    node = node.children[stem];
    parsers.forEach(function(prop){
      self.parse(prop)(parent, stem);
    });
  });

  // process props of last node from its parent using opts
  Object.keys(opts).forEach(function parseProps(prop){
    var value = opts[prop];
    if(value === void 0){ return ; }
    if(value === null){ return delete node[prop]; }
    if(parsers.indexOf(prop) > -1){ // parser gets the parent
      self.parse(prop)(parent, stems, value);
    } else if(util.type(value).plainObject){
      node[prop] = node[prop] || { };
      util.merge(node[prop], util.clone(value));
    } else {
      node[prop] = util.type(value).array
        ? value.slice()
        : value;
    }
  });

  // wipe & return
  stems = opts = parsers = null;
  return this.parse('#set')(this, opts);
};

// ## Manifold.get
// > premise: fallback to parent
//
Manifold.prototype.get = function(stems, opts){
  var boil = this.boil('#get');
  var stem, index = 0, found = this.cache;

  stems = boil(stems, opts);
  while((stem = stems[index])){
    if(found.aliases && found.aliases[stem]){
      stems = boil(stems.join(' ').replace(stem, found.aliases[stem]), opts);
       stem = stems[index];
    }
    if(found.children && found.children[stem]){
      index++; found = found.children[stem];
    } else { index = -1; }
  }

  // wipe, copy & return
  index = stem = null;
  var shallow = util.merge({ }, found);
  return this.parse('#get')(shallow, opts);
};
