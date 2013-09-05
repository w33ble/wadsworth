var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    template = fs.readFileSync(path.join(__dirname, 'page.ejs'), 'utf8');

template = _.template(template);

function getSource(src, callback) {
    if (typeof src === 'function') {
        src(callback);
    } else {
        callback(null, src);
    }
}

function handleError(err, resp) {
    resp.statusCode = 500;
    resp.setHeader('Content-Type', 'text/plain');
    resp.end(resp.toString(), 'utf8');
}

function notFound() {

}

function serve(options) {
    options = options || {};

    var src = options.src || '',
        page = template.call(options);

    function handler(req, resp, next) {
        if (req.url === '/') {
            resp.setHeader('Content-Type', 'text/html; charset=utf-8');
            resp.end(page);
        } else if (req.url === '/script.js') {
            getSource(src, function(err, result) {
                if (err) {
                    return handleError(err, resp);
                }

                resp.setHeader(
                    'Content-Type',
                    'text/javascript; charset=utf-8');
                if (typeof result.pipe === 'function') {
                    result.pipe(resp);
                } else {
                    resp.end(result);
                }
            });
        } else {
            if (next) {
                next();
            } else {
                resp.statusCode = 404;
                resp.setHeader('Content-Type', 'text/plain');
                resp.end('Not found');
            }
        }
    }

    return handler;
}

module.exports = serve;