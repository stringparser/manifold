/* jshint strict: false */
/* global pack: true */

var rootName = 'children';
var app = new pack({ name: rootName });

it('should create nested structures', function(){

  app('hello there you').get()
    .should.be.an.Object
    .and
    .have.property('children');

  app.get('hello').children
    .should.be.an.Object
    .and
    .have.property('there');

  app.get('hello there').children
    .should.be.an.Object
    .and
    .have.property('you');

  app.get('hello there you')
    .should.be.an.Object
    .and
    .not.have.property('children');
});
