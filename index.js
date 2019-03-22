const fs = require('fs');
const path = require('path');
const template = require('./static/index.js');

function getStatic(file) {
  return fs.readFileSync(path.join(__dirname, 'static', file), 'utf8');
}

const consoleScript = getStatic('console.js');
const onErrorScript = getStatic('onerror.js');
const style = getStatic('style.css');

function getSource(src, callback) {
  if (typeof src === 'function') {
    src(callback);
  } else {
    callback(null, src);
  }
}

function handleError(err, resp) {
  resp.statusCode = 500; // eslint-disable-line no-param-reassign
  resp.setHeader('Content-Type', 'text/plain');
  resp.end(resp.toString(), 'utf8');
}

function notFound(resp) {
  resp.statusCode = 404; // eslint-disable-line no-param-reassign
  resp.setHeader('Content-Type', 'text/plain');
  resp.end('Not found');
}

function sendSource(src, resp) {
  resp.setHeader('Content-Type', 'text/javascript; charset=utf-8');

  if (typeof src.pipe === 'function') {
    if (typeof src.on === 'function') {
      src.on('error', err => {
        handleError(err, resp);
      });
    }

    src.pipe(resp);
  } else {
    resp.end(src);
  }
}

module.exports = function serve(options = {}) {
  const data = {
    consoleScript,
    onErrorScript,
    style,
    noConsole: !!options.noConsole,
  };

  const src = options.src || '';
  const page = template(data);

  function root(req, resp) {
    resp.setHeader('Content-Type', 'text/html; charset=utf-8');
    resp.end(page);
  }

  function script(req, resp) {
    function source(err, result) {
      if (err) handleError(err, resp);
      else sendSource(result, resp);
    }

    getSource(src, source);
  }

  return function handler(req, resp, next) {
    if (req.url === '/') {
      root(req, resp);
    } else if (req.url === '/script.js') {
      script(req, resp);
    } else if (next) {
      next();
    } else {
      notFound(resp);
    }
  };
};
