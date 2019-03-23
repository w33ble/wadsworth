const http = require('http');
const test = require('zora');
const express = require('express');
const serve = require('..');
const utils = require('./utils');

function handleServer(server, callback) {
  server.listen(0, err => {
    if (err) callback(err);
    else {
      const url = `http://localhost:${server.address().port}/`;
      callback(null, server, url);
    }
  });
}

async function createExpressServer(options) {
  const app = express().use(serve(options));
  const server = http.createServer(app);
  return new Promise((resolve, reject) => {
    handleServer(server, (err, srv, url) => {
      if (err) reject(err);
      else resolve({ server: srv, url, scriptjs: `${url}script.js` });
    });
  });
}

test('serve from Express server', async t => {
  const { server, url } = await createExpressServer({ src: '' });
  const { res } = await utils.request(url);

  t.equal(res.status, 200);

  utils.closeServer(server);
});

test('serve 404 from Express', async t => {
  const { server, url } = await createExpressServer({ src: '' });
  const { res } = await utils.request(`${url}not_found`);

  t.equal(res.status, 404);

  utils.closeServer(server);
});
