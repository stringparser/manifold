'use strict';

var app = require('./.')();

var res = app
  .set('get /:page/baby order.:beberage(\\d+\\w+) :when', function handle(){})
  .get('get /this/baby order.10beers now whatever works');

console.log(res);
console.log(app.get(res.parent));

var stems = 'get /one/baby order.10beers tomorrow'.split(/[ ]+/);
console.log(app.get(stems));
