'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('add test data', function(){
    sample.forEach(app.set.bind(app));
  });

  it('should have parent added after children were set', function(){
    ;['get /', 'get page.', 'get /:page'].forEach(function(item){
      app.set('get', {children: app.get(item)});
    });

    app.get('get', {ref: true})
      .should.have.property('children', {
        'get /': app.get('get /', {ref: true}),
        'get page.': app.get('get page.', {ref: true}),
        'get /:page': app.get('get /:page', {ref: true})
      });
  });

  it('should not be enumerable after overwrite', function(){
    var getPage = app.get('get', {ref: true});
    getPage.children = {noob: true};

    Object.getOwnPropertyDescriptor(getPage, 'children')
      .should.have.property('enumerable', false);
  });


  it('should inherit properties from its parent', function(){

    function getHandle(){}
    app.set('get', getHandle);

    app.get('get /:page')
      .should.have.property('handle', getHandle);
  });
};
