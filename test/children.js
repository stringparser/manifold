'use strict';

module.exports = function(Manifold, util){
  var app = new Manifold();
  var sample = util.sample();

  it('add test data', function(){
    sample.forEach(app.set.bind(app));
  });

  it('should support single string as input', function(){
    app.set('single.string.parent', {children: 'one'})
       .get('single.string.parent', {ref: true})
       .should.have.property('children', {
         one: {path: 'one'}
       });
  });

  it('should support single object as input', function(){
    app.set('single.object.parent', {children: {path: 'one'}})
       .get('single.object.parent', {ref: true})
       .should.have.property('children', {
         one: {path: 'one'}
       });
  });

  it('should support array as input', function(){

    var stringarray = ['one', 'two', 'three'];
    app.set('string.parent', {children: stringarray})
      .get('string.parent', {ref: true})
      .should.have.property('children', {
        'one': {path: 'one'},
        'two': {path: 'two'},
        'three': {path: 'three'}
      });

    function fn(){} fn.path = 'one';
    var po = {path: 'three'};
    var re = {path: 'two', prop: 'here'};

    var objectarray = [fn, re, po];
    app.set('object.parent', {children: objectarray})
      .get('object.parent', {ref: true})
      .should.have.property('children', {
        one : {path: 'one', handle: fn},
        two : re,
        three : po
      });
  });

  it('support app.get for children', function(){
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


  it('should inherit from parent when', function(){

    function getHandle(){}
    app.set('get', getHandle);

    app.get('get /:page')
      .should.have.property('handle', getHandle);
  });
};
