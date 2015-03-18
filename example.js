'use strict';

var app = require('./.')();

function irand(){
  return Math.floor(Math.random()*10);
}

var input = [
  'get view.things',
  'get view',
  'get view.page',
  '(post|get) :page.view',
  'get page',
  'get',
  'get /:page/view',
  'get /',
  'get /:page',
  'get /:page/:view'
].sort(function(){
  return irand()*Math.pow(-1, irand());
});

console.log(input);
console.log(' ---- ');

function pp(obj){
  if(!obj){ return '[nope]'; }
  return JSON.stringify(obj, null, ' ');
}

input.forEach(app.set.bind(app));
Object.keys(app.store.children).forEach(function(path){
  var node = this[path];
  console.log('stem', pp(node));
  console.log('regex', node.regex);
  console.log('parent', pp(node.parent));
  console.log('children', pp(node.children));
  console.log(' ---- ');
}, app.store.children);

console.log(pp(app.regex));
