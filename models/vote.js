const mongoose = require('mongoose');

const { Schema } = mongoose;

// set up a mongoose model

const VoteSchema = new Schema({
  _p_user: String,
  _p_tweet: String,
  upvote: Boolean,
  downvote: Boolean,
  dateCreated: Date,
});

module.exports = mongoose.model('Vote', VoteSchema, 'Vote');
