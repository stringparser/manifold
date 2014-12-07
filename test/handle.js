/* jshint strict: false */
/* global Manifold: true */

var rootName = 'handle';
var app = new Manifold({ name: rootName });

it('handle for the rootNode', function(){
  function rootHandle(){}
  app.set(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

it('handle for a command', function(){
  function child(){}

  app.set('get page.view /url', child)
    .get('get page.view')
    .should.not.have.property('handle', child);

  app.get('get page.view /url')
    .should.have.property('handle', child);
});

it('only last element should have handle', function(){
  function yourHandle(){}

  app.set('get page.view /other/url', yourHandle);

  app.get('get')
    .should
    .not.have.property('handle');

  app.get('get page.view')
    .should
    .not.have.property('handle');

  app.get('get page.view /other/url')
    .should
    .have.property('handle', yourHandle);
});
