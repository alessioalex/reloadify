# reloadify

Node module that refreshes the browser(s) when your static resources have changed.

Use it with your Node http / Express server without needing anything else (NO BROWSER PLUGINS, NO MANUALLY INJECTING CODE into your pages).

## usage

`reloadify` is installable via `npm` and can be used in 3 possible ways:

1) along with your existing Node server (or Express, etc)

2) standalone, as a live reloading static file server

3) as a CLI app, using 2)

### integrating it with your Node server

Regular [Node http](https://nodejs.org/api/http.html#http_class_http_server):

```js
// initializing it with the watched folder
// (you can also pass an array of multiple folders)
var reloadify = require('reloadify')(__dirname + '/public');

http.createServer(function(req, res) {
  // Express style signature: `reloadify(request, response, next)`
  reloadify(req, res, function() {
    // do stuff afterwords
    if (req.url === '/') {
      fs.readFile(__dirname + '/views/home.html', 'utf8', function(err, content) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content + '\n');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('Page Not Found\n');
    }
  });
}).listen(1337);
```

[Express](http://expressjs.com/):

```js
var reloadify = require('../')(__dirname + '/views');
app.use(reloadify);
```

You can find complete examples inside the `/examples` folder.

### live reloading static file server

```js
var reloadify = require('reloadify');
var folder = __dirname + '/public';
var port = 8080;
var hasSilentLogger = false;

reloadify.serve(folder, port, hasSilentLogger);
```

### cli app

Install it globally with `npm`:

```bash
npm i reloadify -g
```

Usage:

```
Usage: reloadify {OPTIONS}

Options:

      --port, -p  Port to start the server on.

    --folder, -f  Folder to be watched for changes.

    --silent, -s  Disable the logger.

      --help, -h  Show this message.
```

Example:

```sh
reloadify -f myAppFolder -p 4000
```

## how does it work

Responses are intercepted in order for a script to be injected into the page using [inject-html](https://github.com/alessioalex/inject-html).
This script will allow the browser to be notified by the server in realtime using [EventSource](http://www.html5rocks.com/en/tutorials/eventsource/basics/).
The server will send a message to the browser when watched files change, using [chokidar](https://www.npmjs.com/package/chokidar).

## why build another refresh module?

..when there are valid alternatives available, such as:

### LiveReload

I read the following about getting started with [LiveReload](http://livereload.com/):

    1. It works with Safari, Chrome, Firefox and Mobile Safari. Also Opera if you enable web sockets.

    2. Yes, you heard that right, LiveReload <3 iPhones, iPads and their Simulators if you insert a JavaScript snippet.

    3. If adding a tag is not your thing, and you're only interested in desktop browsers, only on your computer, use our browser extensions.

My issues were the following: I wanted a tool that works in every browser without a plugin and without injecting a JavaScript snippet.
Sure, `LiveReload` has a wider scope and does not specifically care about the backend.
However that wasn't my case, as I was working exclusively with Node.

### Browsersync

[Browsersync](http://www.browsersync.io/) is a great tool that does a lot of things and it's really easy to use.

However I wanted something lighter that I could [easily integrate](https://github.com/BrowserSync/browser-sync/issues/154) with my existing Node / Express server.

### Others

As much as I love reinventing the wheel, I also took a look at some other popular alternatives (besides the two previously mentioned) before creating my own thing:

- [live-server](https://github.com/tapio/live-server) - "A simple development http server with live reload capability."
- [easy-livereload](https://github.com/dai-shi/easy-livereload) - "Express middleware to use livereload2 easily (both server and client)"

The first module works fine if you're only doing HTML / CSS / JS stuff, but I wanted something that integrates with an existing Node server.
The second module depends on `LiveReload`, so it's a no-go for the reasons listed before.

Last but not least, it was fun.

## tests

```bash
npm i chromedriver -g
node test/functional.js
```

(to be improved)

## license

[MIT](http://alessioalex.mit-license.org/)
