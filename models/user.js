const mongoose = require('mongoose');

const { Schema } = mongoose;

// set up a mongoose model
const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  admin: Boolean,
  reputation: Number,
  subscribed: Boolean,
  joined: Date,
});

module.exports = mongoose.model('User', UserSchema, 'User');
