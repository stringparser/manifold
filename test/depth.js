'use strict';
/* global Manifold: true */

var rootName = 'depthTest';
var app = new Manifold({ name: rootName });

it('should have proper depth', function(){
  app.set('get page.data /url').get()
    .should.have.property('depth', 0);

  app.get('get')
    .should.have.property('depth', 1);

  app.get('get page.data')
    .should.have.property('depth', 3);

  app.get('get page.data /url')
    .should.have.property('depth', 4);
});

it('should have proper depth when using :params', function(){
  app.set('page view.:data(\\w+\\d*) /url').get()
  .should.have.properties({
    name: 'depthTest',
    depth: 0
  });

  app.get('page view.sunday21 /url')
  .should.have.properties({
    path: 'page view.:data(\\w+\\d*) /url',
    depth: 4
  });
});
