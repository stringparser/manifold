/* jshint strict: false */
/* global Manifold: true */

var rootName = 'boilTest';
var app = new Manifold({ name: rootName });

var manifold = 'get page.data /an/url/with.json';
it('should change how stems are boiled', function(){
  // save default boiler
  var boil = app.boil('#set');
  function boiler(stems){
    if(!stems.length){ return []; }
    return stems
      .map(function(stem){
        return stem.replace(/\/[^\/]+|[^\.]\.+/g, '$& ');
      }).join(' ').trim().split(/[ ]+/);
  }
  app.boil('#set', boiler); app.boil('#get', boiler);

  var index = 0;
  app.set(manifold)
    .boil('#set')(manifold)
    .forEach(function(stem, ind, stems){
      app.get(stems.slice(0, index+1))
        .should.have.property('depth', index+1);
      index++;
    });

  index.should.be.eql(6);
  // restore default boiler
  app.boil('#set', boil);
});
