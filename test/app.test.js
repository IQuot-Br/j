const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../server');

function withServer(handler) {
  return new Promise((resolve, reject) => {
    const httpServer = startServer();
    httpServer.once('listening', async () => {
      const address = httpServer.address();
      const baseUrl = `http://127.0.0.1:${address.port}`;
      try {
        await handler(baseUrl);
      } catch (error) {
        reject(error);
      } finally {
        httpServer.close();
      }
    });
  });
}

test('health route returns ok', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(data, { status: 'ok' });
  });
});

test('register, login and admin summary work', async () => {
  await withServer(async (baseUrl) => {
    const registerResponse = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TestUser', password: '123456' })
    });
    const registerData = await registerResponse.json();
    assert.equal(registerResponse.status, 200);
    assert.equal(registerData.success, true);

    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TestUser', password: '123456' })
    });
    const loginData = await loginResponse.json();
    assert.equal(loginResponse.status, 200);
    assert.equal(loginData.success, true);

    const adminResponse = await fetch(`${baseUrl}/api/admin`);
    const adminData = await adminResponse.json();
    assert.equal(adminResponse.status, 200);
    assert.equal(adminData.adminUser, 'Wentik');
    assert.ok(adminData.stats.totalUsers >= 2);
  });
});
