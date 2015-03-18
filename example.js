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

input.forEach(app.set.bind(app));

console.log(app.store.children);
