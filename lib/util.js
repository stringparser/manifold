'use strict';

var util = { };

util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.Error = require('herro').Herror;

util.boil = function(stems, regex){
  stems = util.type(stems);
  regex = util.type(regex).regexp || /[ ]+/;
  if(!stems.array && !stems.string){ return []; }
  return (stems.string || stems.array.join(' ')).split(regex);
};

exports = module.exports = util;
