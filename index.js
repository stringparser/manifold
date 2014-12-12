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
//  - `opt` type `Object` optional, defaults to { name : '#rootNode' }
//  - `manifold` type `Manifold` optional, defaults to  { }
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
    cache : util.merge(parth.cache, {
      name: util.type(opt.name).string || '#rootNode',
      depth: 0
    }),
    method : { boil:{ }, parse:{ } }
  });

  this.boil('#get', parth.get);
  this.parse('#set', parth.set);
}

// ## Manifold.set
// > premise: set relaxed, get fast
//
// ### arguments
// `stems` type `string`
// `boiler` type `function` optional
//
// ### return
//  - `boiler` function if arguments < 2
//  - `this` otherwise
//
Manifold.prototype.set = function(stems, opts){
  var stemsIs = util.type(stems);
  if( !stemsIs.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     '> stems should be: `string`, `array`, `function` or `object`');
  }

  var self = this;
  var node = this.cache, parent = this.cache;
  var parsers = Object.keys(this.method.parse);

  var optsIs = util.type(opts);
  opts = optsIs.plainObject || stemsIs.plainObject || { };
  opts.handle = stemsIs.function || optsIs.function;

  if(stemsIs.array){
    opts.aliases = stems.slice(1);
    stems = stems[0];
  }

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
    // keep parent to parse #set opts,
    // go next node and parse child props
    parent = node;
    node = node.children[stem];
    parsers.forEach(function(prop){
      self.parse(prop)(parent, stem.substring(0));
    });
  });

  // process props of last node from its parent using opts
  Object.keys(opts).forEach(function parseProps(prop){
    var value = util.clone(opts[prop], true);
    if(value === void 0){ return ; }
    if(value === null){ delete node[prop]; }
    if(parsers.indexOf(prop) > -1){ // parser gets the parent
      self.parse(prop)(parent, stems.slice(), value);
    } else if(util.type(value).plainObject){
      node[prop] = node[prop] || { };
      util.merge(node[prop], value);
    } else { node[prop] = value; }
  });

  // wipe & return
  var ret = this.parse('#set')(this, opts);
  stems = opts = stemsIs = optsIs = parsers = null;
  return ret;
};

// ## Manifold.get
// > premise: fallback to parent
//
Manifold.prototype.get = function(stems, opts){
  var boil = this.boil('#get');
  var stem, index = 0, found = this.cache;
  opts = util.type(opts || stems).plainObject || { };

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
  var node;
  if(!opts.ref){
    node = util.merge({}, found);
    delete node.children;
    node = util.clone(node, true);
  }
  boil = index = stem = null;
  return this.parse('#get')(node || found, opts);
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

util.boil = Parth.prototype.boil;

Manifold.prototype.boil = function(prop, boiler){
  if(arguments.length < 2){
    return this.method.boil[prop] || util.boil;
  }

  if(typeof prop !== 'string'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.boil(prop[, boiler]):\n' +
      ' > `prop` should be a string and, if given, `boiler` a function');
  }

  var self = this;
  this.method.boil[prop] = function(stems, opts){
    stems = boiler.call(self, stems, opts);
    if(!stems){ return null; }
    stems = stems.argv || stems;
    if(util.type(stems).array){ return stems; }
    throw new util.Error(
      ' While boiling `'+prop+'` with boiler(stems, opts):\n'+
      ' > a boiler should return an array a falsy value');
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

  if(typeof prop !== 'string'){
    prop = JSON.stringify(prop);
    throw new util.Error(
      ' While setting `'+prop+'` at this.parse(prop[, parser]):\n' +
      ' > `prop` should be a string and, if given, `parser` a function');
  }

  var self = this;
  this.method.parse[prop] = function(/* arguments */){
    var parsed = parser.apply(self, arguments);
    if(!parsed){ return null; }
    if(util.type(parsed).object){ return parsed; }
    throw new util.Error(
      ' While parsing `'+prop+'` \n'+
      ' parser.apply(self, arguments):\n'+
      ' > a parser should return an object or a falsy value');
  };

  return this;
};
