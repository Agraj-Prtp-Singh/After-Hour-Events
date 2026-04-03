const mongoose = require('mongoose');
const env = require('./env');

async function connectWithUri(uri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
}

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  try {
    await connectWithUri(env.mongodbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    const isSrvDnsError =
      error.code === 'ECONNREFUSED' && String(error.hostname || '').includes('_mongodb._tcp.');

    if (isSrvDnsError && env.mongodbDirectUri) {
      try {
        console.warn('SRV DNS lookup failed. Falling back to MONGODB_URI_DIRECT...');
        await connectWithUri(env.mongodbDirectUri);
        console.log('MongoDB connected successfully using MONGODB_URI_DIRECT');
        return;
      } catch (fallbackError) {
        console.error('MongoDB direct connection fallback failed.');
        console.error(`Reason: ${fallbackError.message}`);
        throw fallbackError;
      }
    }

    console.error('MongoDB connection failed.');
    console.error(`Reason: ${error.message}`);
    console.error(
      'Atlas checklist: verify URL-encoded password, allow your IP in Atlas Network Access, confirm DB user credentials, and set MONGODB_URI_DIRECT if SRV DNS is blocked.'
    );
    throw error;
  }
}

module.exports = connectDatabase;
