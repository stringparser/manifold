/* jshint strict: false */
/* global pack: true */

var rootName = 'parentTest';
var hie = new pack({ name: rootName });

it('should have proper parent', function(){

  hie.get('hello')
    .should.be
    .an.Object
    .and.have
    .property('parent', 'parentTest');

  hie.get('hello there')
    .should.be
    .an.Object
    .and.have
    .property('parent', 'hello');

  hie.get('hello there you')
    .should.be
    .an.Object
    .and.have
    .property('parent', 'hello there');
});
