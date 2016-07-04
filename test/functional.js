/*eslint-disable no-console, func-names*/
'use strict';

var fs = require('fs');
var http = require('http');
var reloadify = require('../');
var tmpDir = require('os').tmpDir() + '/reloadify';
var tmpFilename = tmpDir + '/test-tmpl.txt';
var test = require('tape');
var webdriver = require('selenium-webdriver');
var enableDestroy = require('server-destroy');
var bodyParser = require('body-parser');
var postJson = require('post-json');

test('it should refresh the page on changes', function(t) {
  var rld = reloadify(tmpDir);

  var createTmpFs = function() {
    try {
      fs.mkdirSync(tmpDir);
    } catch (e) {
      if (!(/EXIST/.test(e.message))) {
        throw e;
      }
    }

    fs.writeFileSync(tmpFilename, fs.readFileSync(__filename, 'utf8'));
  };

  var server = http.createServer(function(req, res) {
    rld(req, res, function() {
      bodyParser.json()(req, res, function() {
        var method = req.method.toUpperCase();

        if (['GET', 'HEAD'].indexOf(method) === -1) {
          return res.end(JSON.stringify(req.body));
        }

        if (req.url === '/') {
          fs.readFile(tmpFilename, 'utf8', function(err, content) {
            if (err) {
              console.error(err.stack);
              res.statusCode = 500;
              res.end('Internal Server Error');
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });

            var html = '<title>original</title><pre>';
            html += content + '</pre>\n';

            res.end(html);
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('Page Not Found\n');
        }
      });
    });
  });

  server.listen(1337);
  enableDestroy(server);

  createTmpFs();

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();

  driver.get('http://localhost:1337');

  driver.executeScript('return document.title;').then(function(title) {
    t.equal(title, 'original', 'Original content should be displayed.');
  });

  fs.appendFileSync(tmpFilename, '<p id="new-element">new text</p>');

  driver.wait(function() {
    var script = 'var el = document.getElementById(\'new-element\');';
    script += ' return (el && el.innerHTML);';

    // the page should be refreshed, and the new content should appear
    return driver.executeScript(script).then(function(content) {
      t.equal(content, 'new text', 'Content should be changed.');

      return (content === 'new text');
    });
  }, 5000).then(function() {
    var url = 'http://localhost:1337/foobar';
    var postData = { data: 'foobar' };

    postJson(url, postData, function(err, result) {
      if (err) { throw err; }

      t.deepEqual(JSON.parse(result.body), postData,
          'Non GET/HEAD request should work as usual.');

      // close everything so Node can quit
      driver.quit();
      server.destroy();
      rld.close();
      t.end();
    });
  });
});
