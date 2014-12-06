/* jshint strict: false */
/* global pack: true */

var rootName = 'parentTest';
var app = new pack({ name: rootName });

it('should have its parent', function(){

  app('get page.data /url').get()
    .should.be.an.Object
    .and.not.have.property('parent');

  app.get('get')
    .should.be.an.Object
    .and.have.property('parent', 'parentTest');

  app.get('get page.data')
    .should.be.an.Object
    .and.have.property('parent', 'get');

  app.get('get page.data /url')
    .should.be.an.Object
    .and.have.property('parent', 'get page.data');
});

var aliases = ['a-1', 'a-2', 'a-3'];
it('should work using aliases', function(){
  app(['get page.data'].concat(aliases)).get()
    .should.be.an.Object
    .and.have.property('aliases', {
      'a-1' : 'get page.data',
      'a-2' : 'get page.data',
      'a-3' : 'get page.data'
    });

  aliases.forEach(function(alias){
    app.get(alias)
      .should.have.property('parent', 'get');

    app.get(alias)
      .should.have.property('name', 'get page.data');
  });
});
