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
exports.defineProperty = require('./defineProperty');
exports.defaultParsers = require('./defaultParsers');

// noob parser
//
exports.parse = function(node){
  return node || { };
};
