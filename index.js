var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    template = getStatic('index.ejs'),
    consoleScript = getStatic('console.js'),
    style = getStatic('style.css');

template = _.template(template);

function getStatic(file) {
    return fs.readFileSync(path.join(__dirname, 'static', file), 'utf8');
}

function getSource(src, callback) {
    if (typeof src === 'function') {
        src(callback);
    } else {
        callback(null, src);
    }
}

function sendSource(src, resp) {
    resp.setHeader(
        'Content-Type',
        'text/javascript; charset=utf-8');

    if (typeof src.pipe === 'function') {
        if (typeof src.on === 'function') {
            src.on('error', function(err) {
                handleError(err, resp);
            });
        }

        src.pipe(resp);
    } else {
        resp.end(src);
    }
}

function handleError(err, resp) {
    resp.statusCode = 500;
    resp.setHeader('Content-Type', 'text/plain');
    resp.end(resp.toString(), 'utf8');
}

function notFound(resp) {
    resp.statusCode = 404;
    resp.setHeader('Content-Type', 'text/plain');
    resp.end('Not found');
}

function serve(options) {
    options = _.assign({
        consoleScript: consoleScript,
        style: style
    }, options);

    var src = options.src || '',
        page = template.call(options);

    function handler(req, resp, next) {
        if (req.url === '/') {
            root(req, resp);
        } else if (req.url === '/script.js') {
            script(req, resp);
        } else if (next) {
            next();
        } else {
            notFound(resp);
        }
    }

    function root(req, resp) {
        resp.setHeader('Content-Type', 'text/html; charset=utf-8');
        resp.end(page);
    }

    function script(req, resp) {
        getSource(src, source);

        function source(err, result) {
            if (err) {
                return handleError(err, resp);
            }

            sendSource(result, resp);
        }
    }

    return handler;
}

module.exports = serve;
