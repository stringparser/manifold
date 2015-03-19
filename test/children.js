'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('should be automatically added', function(){
    sample.forEach(app.set.bind(app));
    
    app.get('get', {ref: true})
      .should.have.property('children',{
        'get /': app.get('get /', {ref: true}),
        'get page': app.get('get page', {ref: true}),
        'get /:page': app.get('get /:page', {ref: true})
      });
  });
};
