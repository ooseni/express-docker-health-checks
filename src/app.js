// src/app.js - defines the routes. server.js starts the listener.
const express = require('express');
const { version } = require('../package.json');

const app = express();
app.disable('x-powered-by'); // Disable the X-Powered-By header for security reasons

app.get('/', (req, res) => {
  res.json({ message: 'Hello from express-docker-health-checks' });
});

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    version,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
