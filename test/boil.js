/* jshint strict: false */
/* global Manifold: true */

var rootName = 'boilTest';
var app = new Manifold({ name: rootName });

var manifold = 'get page.data /an/url';
it('should change how stems are boiled', function(){
  // save default boiler
  var boil = app.boil('#set');
  app.boil('#set', function (stems){
    if(!stems.length){ return []; }
    return stems
      .map(function(stem){
        return stem.replace(/\.[^\.]+|\/[^\/]+/g, ' $&');
      }).join(' ').trim().split(/[ ]+/);
  });

  app.set(manifold)
    .boil('#set')(manifold)
    .forEach(function(stem, index, stems){
      app.get(stems.slice(0, index+1))
        .should.have.property('depth', index+1);
    });

  // restore default boiler
  app.boil('#set', boil);
});
