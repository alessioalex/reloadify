#!/usr/bin/env node
'use strict';

var minimist = require('minimist');
var getPort = require('get-port');
var path = require('path');
var dezalgo = require('dezalgo');
var errTo = require('errto');
var serve = require('../lib/serve');
var fs = require('fs');

function displayUsage() {
  fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
}

function buildArgs(cb) {
  var argv = minimist(process.argv.slice(2));
  var port = argv.port || argv.p || 0;
  var silent = Boolean(argv.silent || argv.s);
  var folders = [];

  if (argv.h || argv.help) { return displayUsage(); }

  argv.folder = argv.folder || argv.f;

  if (!argv.folder) {
    console.error('----------------------');
    console.error('Error: folder missing!');
    console.error('----------------------\n');

    return displayUsage();
  }

  folders = Array.isArray(argv.folder) ? argv.folder : [argv.folder];

  folders.map(function(folder) {
    return path.resolve(__dirname + '/..', folder);
  });

  cb = dezalgo(cb);

  if (port === 0) {
    getPort(errTo(cb, function(foundPort) {
      cb(null, folders, foundPort, silent);
    }));
  } else {
    port = parseInt(port, 10);

    cb(null, folders, port, silent);
  }
}

buildArgs(function(err, folder, port, hasSilentLogger) {
  if (err) { throw err; }

  serve(folder, port, hasSilentLogger);
});
