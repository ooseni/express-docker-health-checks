// src/healthcheck.js - run by Docker's HEALTHCHECK inside the container.
// Exit 0 = healthy, exit 1 = unhealthy. Docker only reads the exit code.
const http = require('node:http');

const port = Number(process.env.PORT) || 3000;

const req = http.get(
  { host: '127.0.0.1', port, path: '/health', timeout: 2000 },
  (res) => {
    console.log(`health: HTTP ${res.statusCode}`);
    process.exit(res.statusCode === 200 ? 0 : 1);
  },
);

req.on('timeout', () => {
  console.error('health: no response within 2s');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  console.error(`health: ${err.message}`);
  process.exit(1);
});
