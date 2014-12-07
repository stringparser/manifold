/* jshint strict: false */
/* global Manifold: true */

var rootName = 'children';
var app = new Manifold({ name: rootName });

it('should create nested structures', function(){
  app('get page.widget /url').get()
    .should.have.property('children');

  app.get('get').children
    .should.have.property('page.widget');

  app.get('get page.widget').children
    .should.have.property('/url');

  app.get('get page.widget /url')
    .should.not.have.property('children');
});
