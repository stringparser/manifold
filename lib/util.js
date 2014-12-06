'use strict';

var util = { };

util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.Error = require('herro').Herror;

util.boiler = function(stems, opts){
  stems = util.type(stems);
  if(!stems.string && !stems.array){ return []; }
  if(!opts && stems.array){ return stems.array.slice(); }
  if(stems.array){
    opts.aliases = stems.array.slice(1);
    stems.string = stems.array[0];
  }
  return stems.string.split(/[ ]+/);
};

util.parser = function(node){ return node; };

exports = module.exports = util;
