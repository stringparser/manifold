'use strict';

var app = require('./.')();

var res = app
  .set('go /:place order.:beberage(\\d+\\w+)', function handleIt(){})
  .get('go /haveFun/#hash?query=here order.10beers now');

console.log(res);
console.log(app.get(res.parent));

var stems = 'get /one/baby order.10beers tomorrow'.split(/[ ]+/);
console.log(app.get(stems));
