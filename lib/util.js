'use strict';

var util = { };

util.type = require('utils-type');
util.merge = require('utils-merge');
util.clone = require('lodash.clone');
util.Error = require('herro').Herror;

util.boiler = function(stems, regex){
  stems = util.type(stems);
  if(!stems.string && !stems.array){ return []; }
  if(stems.array){ return stems.slice(); }
  regex = util.type(regex).regexp || /[ ]+/;
  return stems.string.split(regex);
};

util.parser = function(node, prop, value){
  if(!prop){ return node; }
  if(util.type(value).plainObject){
    node[prop] = node[prop] || { };
    util.merge(node[prop], util.clone(value));
  } else {
    node[prop] = util.clone(value);
  }
};

exports = module.exports = util;
