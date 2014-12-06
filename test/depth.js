/* jshint strict: false */
/* global pack: true */

var rootName = 'depth';
var app = new pack({ name: rootName });

it('should have proper depth', function(){
  app('hello there you').get()
    .should.have.property('depth', 0);

  app.get('hello')
    .should.have.property('depth', 1);

  app.get('hello there')
    .should.have.property('depth', 2);

  app.get('hello there you')
    .should.have.property('depth', 3);
});
