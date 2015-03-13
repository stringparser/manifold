/* jshint strict: false */
/* global Manifold: true */

var rootName = 'handle';
var app = new Manifold({ name: rootName });

it('handle for the rootNode', function(){
  function rootHandle(){}
  app.set(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

it('given a path, only last element has it', function(){
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
