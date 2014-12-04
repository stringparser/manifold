'use strict';

var fs = require('fs');

module.exports = {
  testSuite : function(){
    var testSuite = fs.readdirSync(__dirname);
    // in case there is priority
    var testFirst = [
      'rootNode',
      'children'
    ];
    // files to exclude
    var exclude = [
      '_main.js',
      '_util.js'
    ];

    // use it also to omit _main & _util files
    testFirst.concat(exclude).forEach(function(file){
      testSuite.splice(testSuite.indexOf(file), 1);
    });

    return testFirst.concat(testSuite);
  }
};
