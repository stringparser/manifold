'use strict';

var util = { };

util.Error = Error;
util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');

util.boilRE = /((?:\/|\?|\#)[^\/\?\# ]+|[^\. ]+\.)/g;
util.foldRE = new RegExp(util.boilRE.source + '(?:[ ]+|$)', 'g');

util.boil = function(stems){
  stems = util.type(stems);
  if(!stems.string && !stems.array){ return []; }
  return (stems.string || stems.array.join(' '))
    .replace(util.boilRE, '$& ').trim().split(/[ ]+/);
};

util.fold = function(stem){
  return stem.replace(util.foldRE, '$1');
};

util.parse = function(node){ return node; };

exports = module.exports = util;
