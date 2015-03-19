'use strict';
/* global Manifold: true */

var extra = {};
var rootName = 'depthTest';
var app = new Manifold({ name: rootName });

it('should have proper depth', function(){
  app.set('get page.data /url');

  app.get('get page.data /url')
    .should.have.property('depth', 4);
});

it('should have proper depth when using :params', function(){
  app.set('page view.:data(\\w+\\d*) /url');
  app.get('page view.sunday21 /url', extra);
  extra.should.have.properties({
    path: 'page view.sunday21 /url',
    depth: 4
  });
});
