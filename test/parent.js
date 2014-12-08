/* jshint strict: false */
/* global Manifold: true */

var rootName = 'parentTest';
var app = new Manifold({ name: rootName });

it('should have its parent', function(){
  app.set('get page.data /url').get()
    .should.be.an.Object
    .and.not.have.property('parent');

  app.get('get')
    .should.be.an.Object
    .and.have.property('parent', 'parentTest');

  app.get('get page.data')
    .should.be.an.Object
    .and.have.property('parent', 'get page.');

  app.get('get page.data /url')
    .should.be.an.Object
    .and.have.property('parent', 'get page.data');
});
