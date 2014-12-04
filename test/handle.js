/* jshint strict: false */
/* global pack: true */

var rootName = 'handle';
var hie = new pack({ name: rootName });

it('handle for the rootNode', function(){
  function rootHandle(){}
  hie(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

it('handle for a command', function(){
  function child(){}
  hie('hello child', child)
    .get('hello').should
    .not.have.property('handle', child);

  hie.get('hello child')
    .should.have.property('handle', child);
});

it('only last element should have handle', function(){

  function yourHandle(){}

  hie('hello there your', yourHandle);

  hie.get('hello')
    .should
    .not.have.property('handle');

  hie.get('hello there')
    .should
    .not.have.property('handle');

  hie.get('hello there your')
    .should
    .have.property('handle', yourHandle);
});
