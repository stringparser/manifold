/* jshint strict: false */
/* global Manifold: true */

var rootName = 'parseTest';
var app = new Manifold({ name: rootName });

var manifold = 'get page.<name> /an/url';
it('should change how output gets parsed', function(){
  // save default boiler
  var parser = app.parse('#get');
  app.parse('#get', function (node){
    node.parsed = node.name.replace('<name>', '#something');
    return node;
  });

  app(manifold)
    .get(manifold)
    .should.have.property('parsed', 'get page.#something /an/url');

  // restore default boiler
  app.parse('#get', parser);
});
