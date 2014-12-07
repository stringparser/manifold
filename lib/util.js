'use strict';

var util = { };

util.Error = Error;
util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');

util.boiler = function(stems){
  stems = util.type(stems);
  if(!stems.string && !stems.array){ return []; }
  if(stems.array){ return stems.array.slice(); }
  return stems.string.split(/[ ]+/)
    .map(function(stem){
      return stem.replace(/\.[^\.]+|\/[^\/]+/g, ' $&');
    }).join(' ').trim().split(/[ ]+/);
};

util.parser = function(node){ return node; };

exports = module.exports = util;
