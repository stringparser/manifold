'use strict';

var util = { };

exports = module.exports = util;

// dependencies
//
util.Parth = require('parth');
util.type = require('utils-type');
util.omit = require('lodash.omit');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.inherits = require('inherits');

// library util
//
util.parse = function(node){ return node || { }; };
util.voidRE = require('parth/lib/voidRE');

// exclude a group from a regex
//
util.exclude = function(group, source){
  return new RegExp(source.replace(group, '([])'));
};
