const http = require('http');
const { test } = require('tap');
const express = require('express');
const request = require('request');
const serve = require('../');

function handleServer(server, callback) {
  server.listen(0, err => {
    if (err) callback(err);
    else {
      const url = `http://localhost:${server.address().port}/`;
      callback(null, server, url);
    }
  });
}

function createExpressServer(options, callback) {
  const app = express().use(serve(options));
  const server = http.createServer(app);
  handleServer(server, callback);
}

test('serve from Express server', t => {
  createExpressServer({ src: '' }, (err, server, url) => {
    t.notOk(err);

    request(url, (err2, r) => {
      t.notOk(err2);
      t.equal(r.statusCode, 200);

      server.close(() => {
        t.end();
      });
    });
  });
});

test('serve 404 from Express', t => {
  createExpressServer({ src: '' }, (err, server, url) => {
    t.notOk(err);
    request(`${url}not_found`, (err2, r) => {
      t.notOk(err2);
      t.equal(r.statusCode, 404);
      server.close(() => {
        t.end();
      });
    });
  });
});
