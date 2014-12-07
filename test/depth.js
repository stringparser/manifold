/* jshint strict: false */
/* global Manifold: true */

var rootName = 'depth';
var app = new Manifold({ name: rootName });

it('should have proper depth', function(){
  app('get page.data /url').get()
    .should.have.property('depth', 0);

  app.get('get')
    .should.have.property('depth', 1);

  app.get('get page.data')
    .should.have.property('depth', 2);

  app.get('get page.data /url')
    .should.have.property('depth', 3);
});
