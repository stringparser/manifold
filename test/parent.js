'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('add test data', function(){
    sample.forEach(app.set.bind(app));
  });

  it('should have children added after parent is set', function(){
    ;['get /', 'get page.', 'get /:page'].forEach(function(item){
      app.set(item, {parent: app.get('get')});
    });

    app.get('get', {ref: true})
      .should.have.property('children', {
        'get /': app.get('get /', {ref: true}),
        'get page.': app.get('get page.', {ref: true}),
        'get /:page': app.get('get /:page', {ref: true})
      });
  });

  it('should have the same parent by reference', function(){
    ;['get /', 'get page.', 'get /:page'].forEach(function(item){
      app.get(item, {ref: true}).parent
        .should.be.eql(app.get('get', {ref: true}));
    });
  });

  it('property should not be enumerable after overwrite', function(){
    var getPage = app.get('get page.', {ref: true});
    getPage.parent = {noob: true};

    Object.getOwnPropertyDescriptor(getPage, 'parent')
      .should.have.property('enumerable', false);
  });
};
