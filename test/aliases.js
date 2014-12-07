/* jshint strict: false */
/* global Manifold: true */

var rootName = 'aliases';
var app = new Manifold({ name: rootName });

var aliases = ['a1', 'a2', 'a3'];
it('should redirect to node for each alias', function(){
  app(['get page.data /url'].concat(aliases)).get()
    .should.be.an.Object
    .and.have.property('aliases', {
      'a1' : 'get page.data /url',
      'a2' : 'get page.data /url',
      'a3' : 'get page.data /url'
    });

  aliases.forEach(function(alias){
    app.get(alias)
      .should.have.property('name', 'get page.data /url');
  });
});

it('should have its parent via aliases', function(){
  app(['get page.data /url'].concat(aliases));

  aliases.forEach(function(alias){
    app.get(alias)
      .should.have.property('parent', 'get page.data');
  });
});
