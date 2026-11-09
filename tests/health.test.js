// tests/health.test.js - checks every status code the app can return.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');

// app.js reads these when it loads, so set them BEFORE requiring it.
const flag = path.join(os.tmpdir(), `unhealthy-test-${process.pid}`);
process.env.UNHEALTHY_FLAG = flag;
process.env.ENABLE_DEMO_ERRORS = 'true';
const app = require('../src/app');

afterEach(() => {
  fs.rmSync(flag, { force: true });
  jest.restoreAllMocks();
});

describe('GET /health', () => {
  test('returns 200 and status ok when healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('returns 503 and status unhealthy while the flag file exists', async () => {
    fs.writeFileSync(flag, '');
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unhealthy');
  });
});

describe('error responses', () => {
  test('POST /health returns 405 with an Allow header', async () => {
    const res = await request(app).post('/health');
    expect(res.status).toBe(405);
    expect(res.headers.allow).toBe('GET, HEAD');
  });

  test('unknown route returns JSON 404', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });

  test('thrown error returns a generic JSON 500', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});
