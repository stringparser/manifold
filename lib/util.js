'use strict';

var util = { };

exports = module.exports = util;

// dependencies
//
util.Parth = require('parth');
util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.inherits = require('inherits');

// library util
//
util.boil = require('parth/lib/boil');
util.parse = function(node){ return node || { }; };
