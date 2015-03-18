/* jshint strict: false */
/* global Manifold: true */

var rootName = 'parentTest';
var app = new Manifold({ name: rootName });

it('should have its parent', function(){
  app.set('get page.data /url');
  app.set('get page.data');

  app.get('get page.data /url', {ref: true})
    .should.be.an.Object.and
    .have.property('parent', app.get('get page.data',{ref:true}));
});
