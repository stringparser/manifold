'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();

  var sample = util.sample();
  it('add test data', function(){
    sample.forEach(app.set.bind(app));
  });
};
