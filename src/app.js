// src/app.js - defines the routes. server.js starts the listener.
const fs = require('node:fs');
const express = require('express');
const { version } = require('../package.json');

// While this file exists, /health reports 503 (simulates a broken dependency).
const UNHEALTHY_FLAG = process.env.UNHEALTHY_FLAG || '/tmp/unhealthy';

const app = express();
app.disable('x-powered-by'); // Disable the X-Powered-By header for security reasons

app.get('/', (req, res) => {
  res.json({ message: 'Hello from express-docker-health-checks' });
});

app.get('/health', (req, res) => {
  const healthy = !fs.existsSync(UNHEALTHY_FLAG);
  res.set('Cache-Control', 'no-store');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unhealthy',
    version,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.all('/health', (req, res) => {
  res.set('Allow', 'GET, HEAD');
  res.status(405).json({ error: 'Method Not Allowed' });
});

if (process.env.ENABLE_DEMO_ERRORS === 'true') {
  app.get('/boom', () => {
    throw new Error('Simulated failure for the status-code lab');
  });
}

// Catch-all: runs only when no route above matched.
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler: Express recognises it by its FOUR parameters.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
