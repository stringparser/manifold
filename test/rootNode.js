/* jshint strict: false */
/* global pack: true */

var rootName = 'rootNode';
var app = new pack({ name: rootName });

it('should have property name ', function(){
  app.get()
    .should.have
    .property('name', rootName);
});

function rootHandle(){ return; }
it('should have rootHandle', function(){
  app(rootHandle).get()
    .should.have
    .property('handle', rootHandle);
});

var rootCompletion = ['one', 'two', 'three'];
it('should have completion', function(){
  app({ completion: rootCompletion}).get()
    .should.have
    .property('completion', rootCompletion);
});
