/* jshint strict: false */
/* global pack: true */

var rootName = 'parentTest';
var app = new pack({ name: rootName });

it('should have its parent', function(){

  app.get()
    .should.be.an.Object
    .and.have.property('parent', undefined);

  app.get('hello')
    .should.be.an.Object
    .and.have.property('parent', 'parentTest');

  app.get('hello there')
    .should.be.an.Object
    .and.have.property('parent', 'hello');

  app.get('hello there you')
    .should.be.an.Object
    .and.have.property('parent', 'hello there');
});

var aliases = ['a-1', 'a-2', 'a-3'];
it('should work using aliases', function(){
  console.log(aliases, app.get());
});
