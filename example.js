var app = require('./.')();

var res = app
  .set('get /:page/baby order.:beberage(\\d+\\w+) :when', function handle(){})
  .get('get /this/baby order.10beers now');

console.log(res);
