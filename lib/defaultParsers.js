'use strict';

var util = require('./util');

exports = module.exports = {prop: {}};

/* ## manifold.parses.parent(node, parent)
> parse parent properties before they are set

arguments passed from manifold.parse
  - `node` type object
  - `parent` type string, function or plainObject

throws error if
  - parent is not one of the supported types
  - parent is a string but is not defined previously

returns this, the manifold instance

--
api.private
--
*/
exports.prop.parent = function parseParentProp(node, parent){

  var parentType = util.type(parent);
  if(!parentType.match(/plainObject|string/)){
    throw new TypeError('`parent` should a plainObject or a string');
  } else if(typeof parent === 'string'){
    parent = {path: parent};
  } else if(typeof parent.path !== 'string'){
    throw new Error('parent should have a string `path` property ');
  }

  if(!this.store.children[parent.path]){
    this.set(parent.path);
  }

  parent = this.store.children[parent.path];

  if(parent !== node){ // anything but Circular
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

/* ## manifold.parses.children(node, children)
> parse children properties before they are set

arguments passed from manifold.parse
  - `node` type object
  - `children` type array or plainObject

throws error if
  - parent is not one of the supported types

returns this, the manifold instance

--
api.private
--
*/
exports.prop.children = function parseChildrenProps(node, children){
  var childrenType = util.type(children);
  if(!childrenType.match(/string|array|plainObject/)){
    throw new TypeError('`children` should be a string, array or plainObject');
  }

  if(childrenType.string){
    return this.set(children, {parent: node});
  }

  if(typeof children.path === 'string'){
    return this.set(children.path, util.merge({parent: node}, children));
  }

  (childrenType.array || Object.keys(children)).forEach(function(stem){
    var stemType = util.type(stem);
    if(stemType.string){
      this.set(stem, {parent: node});
    } else if(typeof stem.path === 'string'){
      this.set(stem.path, {parent: node});
      if(stemType.match(/function|plainObject/)){
        this.set(stem.path, stem);
      }
    } else {
      throw new TypeError('while setting children for `'+node.path+'`'+
        '\n\n'+
        ' When given as an array or object, each children should be a string\n'+
        ' or have path property that is a string.\n\n'+

        ' Use cases are:\n'+
        '  - set(\'node\', { children: [\'child\', \'sibling\'] })\n' +
        '  - set(\'node\', { children: {[Function: handle] path: \'child\'})\n'+
        '  - set(\'node\', [{path: \'child\'}, {[Function: handle] path: \'sibling\'}])\n' +
        '  - set(\'node\', { child: {prop: \'Hey\'}, sibling: {prop: \'Whats up now?\'} })\n'
      );
    }
  }, this);

  return this;
};
