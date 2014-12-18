'use strict';


var utils = require('util');
var util = { inherits : utils.inherits };

exports = module.exports = util;

util.Error = Error;
util.Parth = require('parth');

util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.fold = require('parth/lib/fold');

var boil = require('parth/lib/boil');
util.boil = function(stems, opt){
  return boil(stems, opt) || [ ];
};
