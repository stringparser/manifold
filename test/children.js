/* jshint strict: false */
/* global pack: true */

var rootName = 'children';
var hie = new pack({ name: rootName });

it('should create nested structures', function(){

  hie('hello there you').get('hello')
    .should.be
    .an.Object
    .and.have
    .property('name', 'hello');

  hie.get('hello there')
    .should.be
    .an.Object
    .and.have
    .property('name', 'hello there');

  hie.get('hello there you')
    .should.be
    .an.Object
    .and.have
    .property('name', 'hello there you');
});
