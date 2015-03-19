'use strict';

exports = module.exports = {};

// dependencies
//
exports.type = require('utils-type');
exports.Parth = require('parth');
exports.merge = require('utils-merge');
exports.clone = require('lodash.clone');
exports.inherits = require('inherits');

// library util
//
exports.boil = require('parth/lib/boil');
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
