/*eslint-disable no-console, func-names*/
'use strict';

var fs = require('fs');
var http = require('http');
var reloadify = require('../')(__dirname + '/views');
var PORT = process.env.PORT || 1337;

http.createServer(function(req, res) {
  reloadify(req, res, function() {
    if (req.url === '/') {
      fs.readFile(__dirname + '/views/home.html', 'utf8', function(err, content) {
        if (err) {
          console.error(err.stack);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content + '\n');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('Page Not Found\n');
    }
  });
}).listen(1337);

console.log('server started on port %s', PORT);
