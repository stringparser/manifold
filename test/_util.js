'use strict';

var fs = require('fs');

module.exports = {
  testSuite : function(){
    var testSuite = fs.readdirSync(__dirname);
    // first tests
    var first = [
      'sample.js',
      'rootNode.js',
      'parent.js',
      'children.js'
    ];
    // files to exclude
    var exclude = [
      '_main.js',
      '_util.js',
      '.jshintrc'
    ];
    // last
    var last = [ ];

    // omit _main & _util files
    first.concat(exclude, last).forEach(function(file){
      testSuite.splice(testSuite.indexOf(file), 1);
    });

    return first.concat(testSuite, last);
  },
  irand : function (){
    return Math.floor(Math.random()*10);
  },
  sample : function(){

    var self = this;
    return [
      'get view.things',
      'get view',
      'get view.page',
      '(post|get) :page.view',
      'get page',
      'get',
      'get /:page/view',
      'get /',
      'get /:page',
      'get /:page/:view'
    ].sort(function(){
      return Math.random()*10*Math.pow(-1, self.irand());
    }, self);
  }
};
