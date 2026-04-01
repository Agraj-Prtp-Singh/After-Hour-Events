const dotenv = require('dotenv');

dotenv.config();

function validateMongoUri(uri) {
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  const queryStartIndex = uri.indexOf('?');
  if (queryStartIndex === -1) {
    return;
  }

  const query = uri.slice(queryStartIndex + 1);
  const params = new URLSearchParams(query);
  const seen = new Set();
  const duplicates = new Set();

  for (const [key] of params.entries()) {
    if (seen.has(key)) {
      duplicates.add(key);
      continue;
    }
    seen.add(key);
  }

  if (duplicates.size > 0) {
    throw new Error(
      `MONGODB_URI contains duplicate query option(s): ${Array.from(duplicates).join(', ')}`
    );
  }
}

const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

validateMongoUri(process.env.MONGODB_URI);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: (() => {
    const rawPort = process.env.PORT;
    if (rawPort === undefined) return 5000;
    const parsed = Number(rawPort);
    return Number.isNaN(parsed) ? 5000 : parsed;
  })(),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

module.exports = env;
