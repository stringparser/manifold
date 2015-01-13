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

Manifold.prototype.set = function(stems, opt){
  var stemsIs = util.type(stems);
  if( !stemsIs.match(/function|string|array|object/g) ){
   throw new util.Error('set(stems [,options]) \n'+
     '> stems should be: `string`, `array`, `function` or `object`');
  }

  var optIs = util.type(opt);
  opt = optIs.plainObject || stemsIs.plainObject || { };
  opt.handle = stemsIs.function || optIs.function;

  stems = (this.parth.set(stems) || '').argv || [ ];
  var node = this.store, parent = this.store;
  stems.forEach(function createChildren(stem){
    // ensure node existence
    if(!node.children){ node.children = { }; }
    if(!node.children[stem]){
      node.children[stem] = {
        path: util.fold((node.path || '') + ' ' + stem),
        depth: node.depth + 1,
        parent: node.path || this.store.name
      };
    }
    parent = node;
    node = node.children[stem];
  }, this);

  // props of last node from its parent using options
  Object.keys(opt).forEach(function parseProps(name){
    var value = util.clone(opt[name], true);
    if(value === void 0){ return ; }
    if(this.parse.prop[name]){
      return this.parse(name)(parent, stems.slice(), value);
    }

    node[name] = node[name] || { };
    if(util.type(value).plainObject){
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
//  - `opt` type `object` optional holding all extra information
//
// return
//  - `found` node
// --
// api.public
// --
//
Manifold.prototype.get = function(stems, opt){
  var stem, index, found;
  opt = opt || util.type(stems).plainObject || { };

  index = 0;
  stems = this.parth.get(stems, opt);
  if(stems || opt.argv){
    stems = (stems || opt).argv;
  } else { index = -1; }

  found = this.store;
  while(index > -1){ // always failback
    stem = stems[index];
    if(found.children && found.children[stem]){
      found = found.children[stem]; index++;
    } else { index = -1; }
  }

  if(opt.ref){ return found; }

  util.merge(opt, found);
  delete opt.children;
  return util.clone(opt, true);
};
