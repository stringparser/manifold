/* jshint strict: false */
/* global Manifold: true */

var rootName = 'childrenTest';
var app = new Manifold({ name: rootName });

it('should create nested structures', function(){
  app.set('get page.widget /url');

  app.get({ref: true})
    .should.have.property('children');

  app.get('get', {ref : true}).children
    .should.have.property('page.');

  app.get('get page.', {ref: true}).children
    .should.have.property('widget');

  app.get('get page.widget', {ref : true}).children
    .should.have.property('/url');

  app.get('get page.widget /url', {ref : true})
    .should.not.have.property('children');
});

it('should be able to create nested using :params structure', function(){
  app.set('(get|post|put|delete) page.:widget /:url');

  app.get({ref: true})
  .should.have.property('children');

  app.get('(get|post|put|delete)', {ref : true}).children
    .should.have.property('page.');

  app.get('(get|post|put|delete) page.', {ref: true}).children
  .should.have.property(':widget');

  app.get('(get|post|put|delete) page.:widget', {ref : true}).children
  .should.have.property('/:url');

  app.get('put page.post /blog', {ref : true})
  .should.not.have.property('children');
});
