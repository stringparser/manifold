'use strict';

var util = require('./util');

exports = module.exports = {};

// ## manifold.parses.parent(node, parent)
// > parse parent properties before they are set
//
// arguments passed from manifold.parse
//  - `node` type object
//  - `parent` type string, function or plainObject
//
// throws error if
//  - parent is not one of the supported types
//  - parent is a string but is not defined previously
//
// returns this, the manifold instance
//
// --
// api.private
// --
//
exports.parent = function parseParentProp(node, parent){
  var parentType = util.type(parent);
  if(!parentType.match(/string|plainObject|function/)){
    throw new TypeError(
      'parent property should a string, function or plainObject'
    );
  } else if(!parentType.string){
    // skip further checking rest of the checks
  } else if(this.store.chilren[parent]){
    return this.set(node.path, {parent: this.get(parent)});
  } else {
    throw new Error(
      'node `'+parent+'` should be set before set it as parent of `'+node+'`\n'+
      'When: while parsing node `'+parent+'` as parent of `'+node.path+'`'
    );
  }

  if(!node.parent){
    util.defineProperty(node, 'parent', 'w', parent);
  } else if(parent !== node.parent){
    node.parent = parent;
  }

  if(!parent.children){
    util.defineProperty(parent, 'children', 'w', {});
  }

  if(!parent.children[node.path]){
    parent.children[node.path] = node;
  }

  return this;
};

// ## manifold.parses.children(node, children)
// > parse children properties before they are set
//
// arguments passed from manifold.parse
//  - `node` type object
//  - `children` type array or plainObject
//
// throws error if
//  - parent is not one of the supported types
//
// returns this, the manifold instance
//
// --
// api.private
// --
//
exports.children = function parseChildrenProps(node, children){

  var stemsType = util.type(children);

  if(stemsType.array){
    stemsType.array.forEach(function(stem){
      this.set(stem, {parent: node});
    }, this);
  } else if(stemsType.object){
    this.set(children);
    util.defineProperty(node, 'children', 'w', {});
    Object.keys(children).forEach(function(stem){
      node.children[stem] = util.clone(children[stem], true);
    });
  }

  return this;
};
