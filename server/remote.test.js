import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { guardRemote, loadRemoteToken } from './remote.js';

function fakeResponse() {
  return {
    status: null,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      this.status = status;
      this.headers = headers;
    },
    end(body = '') {
      this.body = body;
    },
  };
}

const remote = { hosts: ['100.64.0.1'], token: 'a'.repeat(48), port: 4300 };
const request = (host, { cookie, url = '/' } = {}) => ({ headers: { host, cookie }, url, method: 'GET' });
const guard = (req) => {
  const res = fakeResponse();
  const handled = guardRemote(req, res, new URL(req.url, `http://${req.headers.host}`), remote);
  return { handled, res };
};

test('localhost projde bez tokenu', () => {
  assert.equal(guard(request('127.0.0.1:4300')).handled, false);
  assert.equal(guard(request('localhost:4300')).handled, false);
});

test('vzdálený požadavek bez tokenu dostane 401 — stránka i API', () => {
  for (const url of ['/', '/api/progress', '/api/run-node']) {
    const { handled, res } = guard(request('100.64.0.1:4300', { url }));
    assert.equal(handled, true);
    assert.equal(res.status, 401);
  }
});

test('platný token v adrese nastaví cookie a přesměruje na adresu bez tokenu', () => {
  const { handled, res } = guard(request('100.64.0.1:4300', { url: `/?token=${remote.token}` }));
  assert.equal(handled, true);
  assert.equal(res.status, 302);
  assert.match(String(res.headers['Set-Cookie']), /akademie_token=a{48}; .*HttpOnly/);
  assert.doesNotMatch(String(res.headers.Location), /token/);
});

test('platná cookie pustí požadavek dál, cizí ne', () => {
  assert.equal(guard(request('100.64.0.1:4300', { cookie: `x=1; akademie_token=${remote.token}` })).handled, false);
  assert.equal(guard(request('100.64.0.1:4300', { cookie: 'akademie_token=spatne' })).res.status, 401);
  assert.equal(guard(request('100.64.0.1:4300', { url: '/?token=spatne' })).res.status, 401);
});

test('token se vygeneruje jednou a soubor je čitelný jen pro vlastníka', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-remote-'));
  const first = loadRemoteToken(dir);
  assert.ok(first.length >= 32);
  assert.equal(loadRemoteToken(dir), first);
  assert.equal(fs.statSync(path.join(dir, 'remote-token.txt')).mode & 0o777, 0o600);
  fs.rmSync(dir, { recursive: true });
});
