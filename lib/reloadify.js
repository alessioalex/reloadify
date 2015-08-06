'use strict';

var debug = require('debug-app')();
var fs = require('fs');
var uglify = require('uglify-js');
var injectCode = require('inject-html');
var createEventNotifier = require('./event-notifier');
var EventEmitter = require('events').EventEmitter;

// create static JS file to be included in the page
var polyfill = fs.readFileSync(__dirname + '/assets/eventsource-polyfill.js', 'utf8');
var clientScript = fs.readFileSync(__dirname + '/assets/client-script.js', 'utf8');
var script = uglify.minify(polyfill + clientScript, { fromString: true }).code;

function reloadify(dir) {
  var emitter = new EventEmitter();
  var events = createEventNotifier(dir, emitter);
  var inject = injectCode({
    code: '<script>' + script + '</script>'
  });

  var reloadifyMiddleware = function reloadifyMiddleware(req, res, next) {
    // create a middlware that handles requests to `/eventstream`
    events(req, res, function afterEventsCb() {
      if (req.method === 'HEAD' || req.method === 'GET') {
        debug('intercepting response');
        emitter.emit('intercepted', req.url);

        // avoid caching problems with 3rd party modules
        delete req.headers['if-modified-since'];
        delete req.headers['if-none-match'];
        res.setHeader('cache-control', 'no-cache');

        inject(req, res, next);
      }
    });
  };

  reloadifyMiddleware.emitter = emitter;
  reloadifyMiddleware.close = events._closeWatchers;

  return reloadifyMiddleware;
}

module.exports = reloadify;
