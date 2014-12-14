'use strict';

var boil = require('parth/lib/boil');
var utils = require('util');
var util = { inherits : utils.inherits };

exports = module.exports = util;

util.Error = Error;
util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');

util.fold = require('parth/lib/fold');
util.boil = function(stem, o){
  return boil(stem, o) || [ ];
};
