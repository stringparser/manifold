/* jshint strict: false */
/* global Manifold: true */

var app = new Manifold();

it('should have proper path', function(){

  app.get('get')
    .should.have.property('path', 'get');

  app.get('get page.')
    .should.have.property('path', 'get page.');

  app.get('get page.data')
    .should.have.property('path', 'get page.data');

  app.get('get page.data /url')
    .should.have.property('path', 'get page.data /url');
});
