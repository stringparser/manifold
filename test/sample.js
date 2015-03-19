'use strict';

module.exports = function(Manifold, util){

  it('test data creation', function(){
    util.sample();
  });

  it('sample data should be randomly ordered', function(){
    var sampleData = util.sample();
    util.sample().should.not.be.eql(sampleData);
  });

};
