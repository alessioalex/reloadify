/*eslint-disable no-console, func-names*/
'use strict';

var http = require('http');
var onFinished = require('on-finished');
var reloadify = require('./reloadify');
var middleware = require('generic-middleware');
var st = require('st');

function serve(folders, port, hasSilentLogger) {
  var app = middleware();
  var rld = reloadify(folders);
  var log = hasSilentLogger ? function() {} : console.log.bind(console);

  rld.emitter.on('intercepted', function(url) {
    log('http | intercepted url: %s', url);
  });

  rld.emitter.on('change', function(p) {
    log('fs   | file modified: %s', p);
  });

  app.use(function(req, res, next) {
    if (req.url === '/reload') {
      rld.emitter.emit('reload');
      return res.end('OK');
    }

    next();
  });

  app.use(rld);
  app.use(function logRequest(req, res, next) {
    onFinished(res, function(err) {
      if (!err) {
        log('http | %s %s %s', req.method, req.url, res.statusCode);
      }
    });

    next();
  });

  folders.forEach(function(folder) {
    app.use(st({
      path: folder,
      gzip: false,
      cache: false,
      index: 'index.html'
    }));
  });

  /*eslint-disable no-unused-vars*/
  app.use(function pageNotFound(req, res, next) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('Page Not Found\n');
  });

  app.use(function handleErrors(err, req, res) {
    console.error('Reloadify error: \n\n' + err.stack + '\n---');
    res.statusCode = 500;

    return res.end('Internal Server Error');
  });
  /*eslint-enable no-unused-vars*/

  var server = http.createServer(app);
  server.listen(port);

  log('\nhttp | Server up: http://localhost:%s', port);
  log('--------------------------------');
}

module.exports = serve;
