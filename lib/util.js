'use strict';

var util;

exports = module.exports = util;

util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.Error = require('herro').Herror;
