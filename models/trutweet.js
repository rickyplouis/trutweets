const mongoose = require('mongoose');

const { Schema } = mongoose;

// set up a mongoose model
const TruTweetSchema = new Schema({
  text: String,
  creator: String,
  creatorName: String,
  timeStart: Date,
  timeEnd: Date,
  upvotes: Array,
  downvotes: Array,
  status: String,
});

module.exports = mongoose.model('TruTweet', TruTweetSchema, 'TruTweet');
