/* jshint strict: false */
/* global Manifold: true */

var rootName = 'boilTest';
var app = new Manifold({ name: rootName });

it('should change how stems are boiled', function(){
  // save default boiler
  var boil = app.boil('#set');
  function boiler(stems, o){
    boil(stems, (o = o || { }));
    return o.path.split(/[ ]+/);
  }
  app.boil('#set', boiler); app.boil('#get', boiler);

  var index = 0;
  var manifold = 'get page.data /an/url/with.json';
  app.set(manifold)
    .boil('#set')(manifold)
    .forEach(function(stem, ind, stems){
      app.get(stems.slice(0, ind+1))
        .should.have.property('depth', ind+1);
      index++;
    });

  index.should.be.eql(3);
  // restore default boiler
  app.boil('#set', boil);
});
