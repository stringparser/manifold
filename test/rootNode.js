'use strict';

module.exports = function(Manifold, util){

  var app = new Manifold();
  function rootHandle(){ return; }

  it('test data', function(){
    util.sample().forEach(app.set.bind(app));
  });

  it('should insert rootHandle', function(){
    app.set(rootHandle).get()
      .should.have.property('handle', rootHandle);
  });

  it('should not have properties ({ref: undefined}) ', function(){
    app.get()
      .should.not.have.properties(['parent', 'depth']);
  });

  it('should have properties ({ref: true})', function(){
    app.get({ref: true})
      .should.have.property('children');
  });

};
