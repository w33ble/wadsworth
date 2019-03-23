const test = require('zora');
const through = require('through');
const utils = require('./utils');

async function testScript(options, script, t) {
  const { server, scriptjs } = await utils.createServer(options);
  const { res, body } = await utils.request(scriptjs);

  t.equal(res.status, 200);
  t.equal(body, script);

  await utils.closeServer(server);
}

test('serve home page', async t => {
  const { server, url } = await utils.createServer({ src: '' });
  const { res, body } = await utils.request(url);

  t.equal(res.status, 200);
  t.equal(body.indexOf('<!DOCTYPE html>'), 0);
  t.notEqual(body.indexOf('<div id="output"'), -1);
  t.notEqual(body.indexOf('function bindConsole'), -1);
  t.notEqual(body.indexOf('function windowOnError'), -1);
  t.notEqual(body.indexOf('bindConsole()'), -1);
  t.notEqual(body.indexOf('<script>'), -1);
  t.notEqual(body.indexOf('<style>'), -1);

  await utils.closeServer(server);
});

test('skip output when noConsole is true', async t => {
  const { server, url } = await utils.createServer({ src: '', noConsole: true });
  const { res, body } = await utils.request(url);

  t.equal(res.status, 200);
  t.notEqual(body.indexOf('function windowOnError'), -1);
  t.equal(body.indexOf('function bindConsole'), -1);
  t.equal(body.indexOf('<div id="output"'), -1);

  await utils.closeServer(server);
});

test('serve js script', async t => {
  const script = 'alert("Hello World!");';
  const options = { src: script };
  await testScript(options, script, t);
});

test('serve js script from Buffer', async t => {
  const script = 'alert("Hello World!");';
  const options = { src: Buffer.from(script, 'utf8') };
  await testScript(options, script, t);
});

test('serve js from callback function', async t => {
  const script = 'alert("Hello World!");';
  const options = {
    src(callback) {
      process.nextTick(() => {
        callback(null, script);
      });
    },
  };
  await testScript(options, script, t);
});

test('serve js from stream in callback function', async t => {
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
  await testScript(options, script, t);
});

test('handle error in source callback', async t => {
  const { server, scriptjs } = await utils.createServer({
    src(callback) {
      callback(new Error('Test error'));
    },
  });
  const { res } = await utils.request(scriptjs);

  t.equal(res.status, 500);

  await utils.closeServer(server);
});

test('handle error event on source stream', async t => {
  const { server, scriptjs } = await utils.createServer({
    src: callback => {
      const stream = through();
      process.nextTick(() => {
        stream.emit('error', new Error('Test'));
        stream.end();
      });

      callback(null, stream);
    },
  });
  const { res } = await utils.request(scriptjs);

  t.equal(res.status, 500);

  await utils.closeServer(server);
});

test('serve 404 for invalid file', async t => {
  const { server, url } = await utils.createServer({ src: '' });
  const { res } = await utils.request(`${url}not_found`);

  t.equal(res.status, 404);

  await utils.closeServer(server);
});
