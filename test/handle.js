/* jshint strict: false */
/* global pack: true */

var rootName = 'handle';
var app = new pack({ name: rootName });

it('handle for the rootNode', function(){
  function rootHandle(){}
  app(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

it('handle for a command', function(){
  function child(){}
  app('hello child', child)
    .get('hello').should
    .not.have.property('handle', child);

  app.get('hello child')
    .should.have.property('handle', child);
});

it('only last element should have handle', function(){

  function yourHandle(){}

  app('hello there your', yourHandle);

  app.get('hello')
    .should
    .not.have.property('handle');

  app.get('hello there')
    .should
    .not.have.property('handle');

  app.get('hello there your')
    .should
    .have.property('handle', yourHandle);
});
