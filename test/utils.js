const http = require('http');
const fetch = require('node-fetch');
const serve = require('..');

function handleServer(server, callback) {
  server.listen(0, err => {
    if (err) callback(err);
    else {
      const url = `http://localhost:${server.address().port}/`;
      callback(null, server, url);
    }
  });
}

exports.createServer = async function createServer(options) {
  const server = http.createServer(serve(options));
  return new Promise((resolve, reject) => {
    handleServer(server, (err, svr, url) => {
      if (err) reject(err);
      else resolve({ server: svr, url, scriptjs: `${url}script.js` });
    });
  });
};

exports.closeServer = async function closeServer(server) {
  return new Promise(resolve => server.close(() => resolve()));
};

exports.request = async function request(url) {
  const res = await fetch(url);
  const body = await res.text();
  return { res, body };
};
