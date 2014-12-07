/* jshint strict: false */
/* global Manifold: true */

var rootName = 'children';
var app = new Manifold({ name: rootName });

it('should create nested structures', function(){
  app.set('get page.widget /url').get({ref : true})
    .should.have.property('children');

  app.get('get', {ref : true}).children
    .should.have.property('page');

  app.get('get page.widget', {ref : true}).children
    .should.have.property('/url');

  app.get('get page.widget /url', {ref : true})
    .should.not.have.property('children');
});
