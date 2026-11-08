// src/server.js - starts the HTTP server and shuts it down cleanly.
const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Listening on port ${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing server`);
  server.close(() => {
    console.log('Server closed, exiting');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref(); // force exit after 10 seconds
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
