const moment = require('moment');

const add24Hours = date => moment(date).add(24, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a');

const getProgress = (timeStart = new Date(), timeEnd = new Date()) => {
  const now = moment(new Date());
  const begin = moment(timeStart);
  const end = moment(timeEnd);
  if (now.isAfter(end)) {
    return 100;
  }
  const duration = moment.duration(end.diff(begin));
  const totalSeconds = duration.asSeconds();
  const timePassed = moment.duration(now.diff(begin)).asSeconds();
  return (timePassed / totalSeconds) * 100;
};

const assignProgress = (trutweets = []) => trutweets.map((tweet) => {
  const tweetCopy = Object.assign({}, tweet);
  tweetCopy.progress = getProgress(tweet.timeStart, tweet.timeEnd);
  return tweetCopy;
});

module.exports = {
  add24Hours,
  getProgress,
  assignProgress,
};
