const User = require('../models/user.model');

class UserRepository {
  create(data) {
    return User.create(data);
  }

  findByEmail(email) {
    return User.findOne({ email });
  }

  findById(id) {
    return User.findById(id).select('-passwordHash');
  }
}

module.exports = new UserRepository();
