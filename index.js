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
//  - `opt` type `Object` optional
//
// returns
//  - manifold instance
//
function Manifold(o){

  if(!(this instanceof Manifold)){
    return new Manifold(o);
  }

  o = o || { };
  this.parth = new util.Parth();
  this.store = {
    name: util.type(o.name).string || '#rootNode',
    depth: 0
  };

  // ## manifold.parse(name[, parser])
  // > premise: general purpose parsers go here
  //
  // arguments
  //  - `name` type `string`
  //  - `parser` type `function` optional
  //
  // return
  //  - `parser` function if arguments < 2
  //  - `this` otherwise
  //

  this.parse = function (name, parser){
    if(arguments.length < 2){
      return this.parse.prop[name] || util.parse;
    }

    if(typeof prop !== 'string' && typeof parser !== 'function'){
      name = JSON.stringify(name);
      throw new util.Error(
        ' While setting `'+name+'` at this.parse(prop[, parser]):\n' +
        ' > `prop` should be a string and, if given, `parser` a function');
    }

    var self = this;
    this.parse.prop[name] = function(/* arguments */){
      return parser.apply(self, arguments) || { };
    };

    return this;
  };
  this.parse.prop = Object.create(null);
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

  var oIs = util.type(o);
  o = oIs.plainObject || stemsIs.plainObject || { };
  o.handle = stemsIs.function || oIs.function;

  if(stemsIs.array || stemsIs.string){
    stems = this.parth.set(stems).argv;
  } else { stems = []; }

  var node = this.store, parent = this.store;
  stems.forEach(function createChildren(stem, index){
    // ensure node existence
    if(!node.children){ node.children = { }; }
    if(!node.children[stem]){
      node.children[stem] = {
        path: util.fold(stems.slice(0, index+1).join(' ')),
        depth: node.depth + 1,
        parent: node.path || this.store.name
      };
    }
    parent = node;
    node = node.children[stem];
  }, this);

  // props of last node from its parent using options
  Object.keys(o).forEach(function parseProps(name){
    var value = util.clone(o[name], true);
    if(value === void 0){ return ; }
    if(value === null){ delete node[name]; }
    if(this.parse.prop[name]){
      this.parse(name)(parent, stems.slice(), value);
    } else if(util.type(value).plainObject){
      node[name] = node[name] || { };
      util.merge(node[name], value);
    } else { node[name] = value; }
  }, this);

  return this;
};

// ## Manifold.get(stems[, opt])
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
  var stem, index, found;
  o = o || util.type(stems).plainObject || { };

  index = 0;
  stems = this.parth.get(stems, o);

  if(stems || o.argv){
    stems = (stems || o).argv;
  } else { index = -1; }

  found = this.store;
  while(index > -1){ // always failback
    stem = stems[index];
    if(found.children && found.children[stem]){
      found = found.children[stem]; index++;
    } else { index = -1; }
  }

  if(o.ref){ return found; }

  stem = o.path;
  util.merge(o, found);
  delete o.children;
  o.path = stem;
  return util.clone(o, true);
};
