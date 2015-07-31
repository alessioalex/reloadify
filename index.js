'use strict';

var reloadify = require('./lib/reloadify');
var serve = require('./lib/serve');

reloadify.serve = serve;

module.exports = reloadify;
