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
  if(!parentType.match(/plainObject/)){
    throw new TypeError('parent property should be a plainObject');
  } else if(typeof parent.path !== 'string'){
    throw new Error('parent should have a string `path` property ');
  }

  if(!this.store.children[parent.path]){
    var parentProps = util.merge({children: {}}, parent);
    parentProps.children[node.path] = node;
    return this.set(parent.path, parentProps);
  }

  parent = this.store.children[parent.path];

  if(!node.parent || node.parent !== parent){
    node.parent = parent;
  }

  if(!parent.children){
    parent.children = {};
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
  var childrenType = util.type(children);
  if(!childrenType.match(/array|plainObject/)){
    throw new TypeError('children should be an array or plainObject');
  }

  if(childrenType.array){
    return children.forEach(function(stem){
      if(typeof stem === 'string'){
        this.set(stem, {parent: node});
      } else if(util.type(stem).plainObject && typeof stem.path === 'string'){
        this.set(stem.path, util.merge({parent: node}, stem));
      } else {
        throw new TypeError(
          'when given as an array, children property '+
          'should be strings or plainObjects with a string path property'
        );
      }
    }, this);
  }

  if(typeof children.path === 'string'){
    this.set(children.path, util.merge({parent: node}, children));
  } else {
    Object.keys(children).forEach(function(key){
      var stem = children[key];
      if(util.type(stem).plainObject && typeof stem.path === 'string'){
        this.set(stem.path, util.merge({parent: node}, stem));
      } else {
        throw new TypeError(
          'when given as an object, children property keys '+
          'should be objects with a string path property'
        );
      }
    });
  }

  return this;
};
