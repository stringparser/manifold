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

function pp(obj, sep){
  if(!obj){ return '[nope]'; }
  return JSON.stringify(obj, null, sep || ' ');
}

input.forEach(app.set.bind(app));
Object.keys(app.store.children).forEach(function(path){
  var node = this[path];
  console.log('stem', node);
  console.log('regex', node.regex);
  console.log('parent', pp(node.parent));
  console.log('children', pp(node.children));
  console.log(' ---- ');
}, app.store.children);

app.set('get', function getHandle(){});

app.set({name: 'test'});

app.set('get /:page/:view', function getPageView(){});

console.log(app.get('get /user/profile'));
console.log(app.store);
