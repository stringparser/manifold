/* jshint strict: false */
/* global Manifold: true */

var rootName = 'parseTest';
var app = new Manifold({ name: rootName });

it('should provide general purpose parser', function(){
  // save default boiler
  app.parse('#number', function(arg){
    return arg + 1;
  });

  app.parse('#number')(2).should.be.eql(3);
});

it('should be able to parse node properties', function(){
  // save default boiler
  app.parse('property', function(node, arg){
    node.property = arg + 1;
  });

  app.set('path', { property: 2 });
  app.get('path').should.have.property('property', 3);
});
