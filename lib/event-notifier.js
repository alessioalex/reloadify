'use strict';

var debug = require('debug-app')();
var sendevent = require('sendevent');
var chokidar = require('chokidar');
var throttle = require('lodash.throttle');

function createEventNotifier(dir, emitter) {
  var events = sendevent('/eventstream');

  var dirs = Array.isArray(dir) ? dir : [dir];
  var sendNotification = throttle(function sendNotification() {
    events.broadcast({ msg: 'reload' });
  }, 1000);

  var watchers = [];

  emitter.on('reload', sendNotification);

  dirs.forEach(function createDirWatcher(d) {
    var watcher = chokidar.watch(d);

    watcher.on('change', function notifyPathChange(path) {
      debug('change detected: ' + path);
      emitter.emit('change', path);
      sendNotification();
    });

    watchers.push(watcher);
  });

  events._closeWatchers = function closeWatchers() {
    watchers.forEach(function closeWatcher(w) { w.close(); });
  };

  return events;
}

module.exports = createEventNotifier;
