'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('should have parent added after set', function(){
    sample.forEach(app.set.bind(app));

    var node = app.get('get page.', {ref: true});
    console.log(node.parent.children);
    console.log(Object.getOwnPropertyNames(node));

  });

  it('should not be enumerable after overwrite', function(){
    var getPage = app.get('get page.', {ref: true});
    getPage.children = {noob: true};

    Object.getOwnPropertyDescriptor(getPage, 'children')
      .should.have.property('enumerable', false);
  });
};
