const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error(`Reason: ${error.message}`);
    console.error(
      'Atlas checklist: verify URL-encoded password, allow your IP in Atlas Network Access, and confirm DB user credentials.'
    );
    throw error;
  }
}

module.exports = connectDatabase;
