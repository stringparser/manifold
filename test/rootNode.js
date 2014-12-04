/* jshint strict: false */
/* global pack: true */

var rootName = 'rootNode';
var hie = new pack({ name: rootName });

it('should have property name ', function(){
  hie.get()
    .should.have
    .property('name', rootName);
});

function rootHandle(){ return; }
it('should have rootHandle', function(){
  hie(rootHandle).get()
    .should.have
    .property('handle', rootHandle);
});

var rootCompletion = ['one', 'two', 'three'];
it('should have completion', function(){
  hie({ completion: rootCompletion}).get()
    .should.have
    .property('completion', rootCompletion);
});
