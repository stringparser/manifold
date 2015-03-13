/* jshint strict: false */
/* global Manifold: true */

var rootName = 'parseTests';
var app = new Manifold({ name: rootName });

it('should parse properties when one sets them', function(){
  app.parse('prop', function(node, value){
    if(typeof value === 'number'){
      node.number = value + 1;
    }
  });

  app.set({prop: 0}).get()
    .should.have.property('number', 1);
});

it('should support objects for setting parsers', function(){
  app.parse({
    number: function(node, value){
      node.number = value + 2;
    },
    string: function(node, value){
      node.string = value.trim();
    }
  });

  app.set({
    number: 0,
    string: '  hello'
  }).get().should.have.properties({
    number: 2,
    string: 'hello'
  });
});
