const mongoose = require('mongoose');
const env = require('../config/env');
const { normalizeRole, ROLES } = require('../constants/roles');
const User = require('../models/user.model');

async function run() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000
    });
  } catch (error) {
    const isSrvDnsError =
      error.code === 'ECONNREFUSED' && String(error.hostname || '').includes('_mongodb._tcp.');

    if (!isSrvDnsError || !env.mongodbDirectUri) {
      throw error;
    }

    console.warn('SRV DNS lookup failed during role migration. Falling back to MONGODB_URI_DIRECT...');
    await mongoose.connect(env.mongodbDirectUri, {
      serverSelectionTimeoutMS: 10000
    });
  }

  const users = await User.find({}, '_id role');
  let updatedCount = 0;
  let fallbackToStudentCount = 0;

  for (const user of users) {
    const normalizedRole = normalizeRole(user.role) || ROLES.STUDENT;
    if (user.role !== normalizedRole) {
      if (!normalizeRole(user.role)) {
        fallbackToStudentCount += 1;
      }
      user.role = normalizedRole;
      await user.save();
      updatedCount += 1;
    }
  }

  console.log(
    `Role migration complete. Total users: ${users.length}, updated: ${updatedCount}, fallback_to_student: ${fallbackToStudentCount}`
  );
}

run()
  .catch((error) => {
    console.error('Role migration failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
