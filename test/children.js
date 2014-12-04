/* jshint strict: false */
/* global pack: true */

var rootName = 'children';
var hie = new pack({ name: rootName });

it('should create nested structures', function(){

  hie('hello there you').get()
    .should.be.an.Object
    .and
    .have.property('children');

  hie.get('hello').children
    .should.be.an.Object
    .and
    .have.property('there');

  hie.get('hello there').children
    .should.be.an.Object
    .and
    .have.property('you');

  hie.get('hello there you')
    .should.be.an.Object
    .and
    .not.have.property('children');
});
