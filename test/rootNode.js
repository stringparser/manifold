/* jshint strict: false */
/* global Manifold: true */

var app = new Manifold();

it('should not have properties', function(){
  app.get().should.not
    .have.properties(['parent', 'depth']);
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
