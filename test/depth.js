/* jshint strict: false */
/* global pack: true */

var rootName = 'depth';
var hie = new pack({ name: rootName });

it('should have proper depth', function(){
  hie('hello there you').get()
    .should.have.property('depth', 0);

  hie.get('hello')
    .should.have.property('depth', 1);

  hie.get('hello there')
    .should.have.property('depth', 2);

  hie.get('hello there you')
    .should.have.property('depth', 3);
});
