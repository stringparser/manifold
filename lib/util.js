'use strict';

exports = module.exports = {};

// dependencies
//
exports.Parth = require('parth');
exports.type = require('utils-type');
exports.omit = require('lodash.omit');
exports.merge = require('utils-merge');
exports.clone = require('lodash.clone');
exports.inherits = require('inherits');

// library util
//
exports.voidRE = require('parth/lib/voidRE');
exports.defineProperty = require('parth/lib/defineProperty');

// noob parser
//
exports.parse = function(node){
  return node || { };
};

// exclude a group from a regex
//
exports.exclude = function(group, regex){
  return new RegExp(regex.source.replace(group, '([])'));
};
