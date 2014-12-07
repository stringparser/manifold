/* jshint strict: false */
/* global Manifold: true */

var rootName = 'nameTest';
var app = new Manifold({ name: rootName });

it('should have proper name', function(){
  app.set('get page.data /url').get()
    .should.have.property('name', rootName);

  app.get('get')
    .should.have.property('name', 'get');

  app.get('get page.data')
    .should.have.property('name', 'get page .data');

  app.get('get page.data /url')
    .should.have.property('name', 'get page .data /url');
});
