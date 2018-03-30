const http = require('http');
const { test } = require('tap');
const express = require('express');
const request = require('request');
const through = require('through');
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

function createServer(options, callback) {
  const server = http.createServer(serve(options));
  handleServer(server, callback);
}

function createExpressServer(options, callback) {
  const app = express().use(serve(options));
  const server = http.createServer(app);
  handleServer(server, callback);
}

function testScript(options, script, t) {
  createServer(options, (err, server, url) => {
    t.notOk(err);

    request(`${url}script.js`, (err2, r, body) => {
      t.notOk(err2);
      t.equal(r.statusCode, 200);
      t.equal(body, script);

      server.close(() => {
        t.end();
      });
    });
  });
}

test('serve home page', t => {
  createServer({ src: '' }, (err, server, url) => {
    t.notOk(err);
    request(url, (err2, r, body) => {
      t.notOk(err2);
      t.equal(r.statusCode, 200);
      t.equal(body.indexOf('<!DOCTYPE html>'), 0);
      t.notEqual(body.indexOf('<div id="output"'), -1);
      t.notEqual(body.indexOf('function bindConsole'), -1);
      t.notEqual(body.indexOf('bindConsole()'), -1);
      t.notEqual(body.indexOf('<script>'), -1);
      t.notEqual(body.indexOf('<style>'), -1);

      server.close(() => {
        t.end();
      });
    });
  });
});

test('skip output when noConsole is true', t => {
  createServer({ src: '', noConsole: true }, (err, server, url) => {
    t.notOk(err);

    request(url, (err2, r, body) => {
      t.notOk(err2);
      t.equal(r.statusCode, 200);
      t.equal(body.indexOf('<script>'), -1);
      t.equal(body.indexOf('<style>'), -1);
      t.equal(body.indexOf('<div id="output"'), -1);

      server.close(() => {
        t.end();
      });
    });
  });
});

test('serve js script', t => {
  const script = 'alert("Hello World!");';
  const options = { src: script };
  testScript(options, script, t);
});

test('serve js script from Buffer', t => {
  const script = 'alert("Hello World!");';
  const options = { src: Buffer.from(script, 'utf8') };
  testScript(options, script, t);
});

test('serve js from callback function', t => {
  const script = 'alert("Hello World!");';
  const options = {
    src(callback) {
      process.nextTick(() => {
        callback(null, script);
      });
    },
  };
  testScript(options, script, t);
});

test('serve js from stream in callback function', t => {
  const script = 'alert("Hello World!");';
  const options = {
    src: callback => {
      const stream = through();
      process.nextTick(() => {
        stream.queue(script, 'utf8');
        stream.end();
      });

      callback(null, stream);
    },
  };
  testScript(options, script, t);
});

test('handle error in source callback', t => {
  const options = {
    src(callback) {
      callback(new Error('Test error'));
    },
  };

  createServer(options, (err, server, url) => {
    t.notOk(err);

    request(`${url}script.js`, (err2, r) => {
      t.notOk(err2);
      t.equal(r.statusCode, 500);

      server.close(() => {
        t.end();
      });
    });
  });
});

test('handle error event on source stream', t => {
  const options = {
    src: callback => {
      const stream = through();
      process.nextTick(() => {
        stream.emit('error', new Error('Test'));
        stream.end();
      });

      callback(null, stream);
    },
  };

  createServer(options, (err, server, url) => {
    t.error(err, 'created server');
    request(`${url}script.js`, (err2, r) => {
      t.error(err2, 'requested script');
      t.equal(r.statusCode, 500);

      server.close(() => {
        t.end();
      });
    });
  });
});

test('serve 404 for invalid file', t => {
  createServer({ src: '' }, (err, server, url) => {
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
