const mongoose = require('mongoose');

const { userSchema } = require('../schema/user');

module.exports.User = mongoose.model('User', userSchema);