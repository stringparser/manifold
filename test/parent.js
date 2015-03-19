'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('should have children added after set', function(){
    sample.forEach(app.set.bind(app));

    app.get('get', {ref: true})
      .should.have.property('children', {
        'get /': app.get('get /', {ref: true}),
        'get page.': app.get('get page.', {ref: true}),
        'get /:page': app.get('get /:page', {ref: true})
      });
  });

  it('should not be enumerable after overwrite', function(){
    var getPage = app.get('get page.', {ref: true});
    getPage.parent = {noob: true};

    Object.getOwnPropertyDescriptor(getPage, 'parent')
      .should.have.property('enumerable', false);
  });
};
