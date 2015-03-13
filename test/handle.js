/* jshint strict: false */
/* global Manifold: true */

var rootName = 'handle';
var app = new Manifold({ name: rootName });

function rootHandle(){}
it('handle for the rootNode', function(){
  app.set(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

function yourHandle(){}
it('given a path, only last element has it', function(){
  app.set('get page.view /other/url', yourHandle);

  app.get('get')
    .should.have.property('handle', rootHandle);

  app.get('get page.view')
    .should.have.property('handle', rootHandle);

  app.get('get page.view /other/url')
    .should.have.property('handle', yourHandle);
});
