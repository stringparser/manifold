/* jshint strict: false */
/* global Manifold: true */

var rootName = 'pathTest';
var app = new Manifold({ name: rootName });

it('should have proper path', function(){

  app.set('get page.data /url').get()
    .should.have.property('name', rootName);

  app.get('get')
    .should.have.property('path', 'get');

  app.get('get page.')
    .should.have.property('path', 'get page.');

  app.get('get page.data')
    .should.have.property('path', 'get page.data');

  app.get('get page.data /url')
    .should.have.property('path', 'get page.data /url');
});
