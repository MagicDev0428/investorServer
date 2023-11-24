const mongoose = require('mongoose');

module.exports.userSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String
});