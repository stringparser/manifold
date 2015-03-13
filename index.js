'use strict';

var util = require('./lib/util');

exports = module.exports = Manifold;

// # Manifold constructor
//
// arguments
//  - options, type `object` optional
//
// returns a new manifold instance
//
function Manifold(o){
  if(this instanceof Manifold){
    o = o || { };
    this.parth = new util.Parth();
    this.store = {name: util.type(o.name).string || '#rootNode'};
    return this;
  }
  return new Manifold(o);
}

// ## manifold.set(stems[, options])
// setup a nested object for regexp lookup
//
// arguments
//  - stems, type `string`, plain `object` or `function`
//  - options, type plain `object` or `function`
//
// returns this
//
Manifold.prototype.set = function(stems, o){
  var sis = util.type(stems);
  if( !sis.match(/string|function|plainObject/) ){
   throw new TypeError('set(stems[, options]) \n'+
     'stems should be a `string`, `function` or a plain `object`');
  }

  var ois = util.type(o), handle = sis.function || ois.function;
  o = ois.plainObject || sis.plainObject || {};
  if(handle){ o.handle = handle; }
  var node = this.store;
  stems = sis.string;

  if(stems){
    stems = this.parth.set(stems);
    stems.argv.forEach(function(stem){
      node.children = node.children || {};
      node = node.children[stem] = node.children[stem] || {
        stem: stems.path.slice(0, stems.path.indexOf(stem) + stem.length),
        depth: node.depth + 1 || 1,
        parent: node.stem || node.name
      };
    });
  }

  Object.keys(o).forEach(function(key){
    var value = util.clone(o[key], true);
    if(value === null){ delete node[key]; }
    else if(this.parses && this.parses[key]){
      this.parses[key].call(this, node, value, stems);
    } else if(util.type(value).plainObject){
      node[key] = node[key] || {};
      util.merge(node[key], value);
    } else {
      node[key] = value;
    }
  }, this);

  return this;
};

// ## manifold.get(stems[, options])
// > string maching a regexp to find an object
//
// arguments
//  - stems, type `string`
//  - options, type `object` with all extra information
//
// returns the object `node` found
//
Manifold.prototype.get = function(path, o){
  var stem, stems, index = -1;
  o = util.type(o || path).object || {};

  if(typeof path === 'string'){
    stems = this.parth.get(path, o);
    if(stems){ index = 0; }
    else if(o.ref){ index = 0; stems = o; }
  }

  var found = this.store;
  while(index > -1){
    stem = stems.argv[index];
    if(found.children && found.children[stem]){
      found = found.children[stem]; index++;
    } else { index = -1; } // always failback
  }

  if(o.ref){ return found; }

  util.merge(o, found);
  delete o.children;

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
  if(!parser && (!prop || typeof prop === 'string')){
    return (this.parses && this.parses[prop]) || util.parse;
  } else if(util.type(prop).plainObject){
    Object.keys(prop).forEach(function(key){
      this.parse(key, prop[key]);
    }, this);
  } else if(typeof prop !== 'string'){
    throw new TypeError('parse(prop, parser):\n'+
      '> prop should be a `string` or an `object` ');
  } else {
    if(!this.parses){ this.parses = {}; }
    this.parses[prop] = parser;
  }

  return this;
};
