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
  app(rootHandle).get()
    .should.have.property('handle', rootHandle);
});

var rootCompletion = ['one', 'two', 'three'];
it('should have completion', function(){
  app({completion: rootCompletion}).get()
    .should.have.property('completion', rootCompletion);
});

var aliases = ['a1', 'a2', 'a3'];
it('should have aliases', function(){
  app({ aliases : aliases }).get()
    .should.have.property('aliases', {
      'a1': rootName,
      'a2': rootName,
      'a3': rootName
    });

  aliases.forEach(function(alias){
    app.get(alias)
      .should.have.property('name', rootName);
  });
});
