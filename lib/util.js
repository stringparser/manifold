'use strict';

exports = module.exports = {};

// dependencies
//
exports.type = require('utils-type');
exports.Parth = require('parth');
exports.merge = require('lodash.merge');
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

// Parth shortcut
//
var proto = exports.Parth.prototype;
exports.ParthProto = function(instance, method){
  return function (/* arguments */){
    return proto[method].apply(instance, arguments);
  };
};
