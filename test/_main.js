'use strict';

var pack = require('../');
var path = require('path');
var util = require('./_util.js');
var packageName = require('../package').name;

describe(packageName, function(){
  util.testSuite().forEach(function(file){
    var suite = path.basename(file, path.extname(file));
    describe(suite, function(){
      // the actual suite code
      require('./'+file)(pack, util);
    });
  });
});
