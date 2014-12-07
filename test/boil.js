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
        return stem.replace(/[^\.]\.+|\/[^\/]+/g, '$& ');
      }).join(' ').trim().split(/[ ]+/);
  });

  var index = 0;
  app.set(manifold)
    .boil('#set')(manifold)
    .forEach(function(stem, ind, stems){
      app.get(stems.slice(0, index+1))
        .should.have.property('depth', index+1);
      index++;
    });

    index.should
      .be.eql(app.boil('#set')(manifold).length);

  // restore default boiler
  app.boil('#set', boil);
});
