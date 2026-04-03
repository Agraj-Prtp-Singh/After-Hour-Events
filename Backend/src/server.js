const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');

async function startServer() {
  try {
    await connectDatabase();
    const server = app.listen(env.port, () => {
      const boundPort = server.address()?.port;
      console.log(`Server running on port ${boundPort || env.port}`);
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${env.port} is already in use. Stop the other process or change PORT in .env.`);
      } else {
        console.error('Server failed to start', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
