/* jshint strict: false */
/* global Manifold: true */

var rootName = 'childrenTest';
var app = new Manifold({ name: rootName });

it('should create nested structures', function(){
  app.set('get page.widget /url');
  app.set('get page.widget');

  app.get({ref: true})
    .should.have.property('children');

  app.get('get page.widget', {ref : true}).children
    .should.have.property('get page.widget /url');

  app.get('get page.widget /url', {ref : true})
    .should.not.have.property('children');
});

it('should be able to create nested using :params', function(){
  app.set('get page.');
  app.set('(get|post|put|delete) page.:widget');

  app.get('get page.', {ref: true})
    .should.have.property('children');


});
