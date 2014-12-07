'use strict';

var fs = require('fs');

module.exports = {
  testSuite : function(){
    var testSuite = fs.readdirSync(__dirname);
    // first tests
    var first = [
      'rootNode.js',
      'path.js',
      'depth.js',
      'parent.js',
      'handle.js'
    ];
    // files to exclude
    var exclude = [
      '_main.js',
      '_util.js'
    ];
    // last
    var last = [
      'boil.js',
      'parse.js'
    ];

    // use it also to omit _main & _util files
    first.concat(exclude, last).forEach(function(file){
      testSuite.splice(testSuite.indexOf(file), 1);
    });

    return first.concat(testSuite, last);
  }
};
