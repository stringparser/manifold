/* jshint strict: false */
/* global Manifold: true */

var rootName = 'rootNode';
var app = new Manifold({ name: rootName });

it('should have property name ', function(){
  app.get()
    .should.have.property('name', rootName);
});

function rootHandle(){ return; }
it('should have rootHandle', function(){
  app.set(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

var rootCompletion = ['one', 'two', 'three'];
it('should have completion', function(){
  app.set({completion: rootCompletion}).get()
    .should.have.property('completion', rootCompletion);
});
