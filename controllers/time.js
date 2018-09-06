const moment = require('moment');

const add24Hours = date => moment(date).add(24, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a');

const getProgress = (tweet) => {
  let { timeStart, timeEnd } = tweet;
  const now = moment(new Date());
  timeStart = moment(timeStart);
  timeEnd = moment(timeEnd);
  if (now > timeEnd) {
    return 100;
  }
  const duration = moment.duration(timeEnd.diff(timeStart));
  const totalSeconds = duration.asSeconds();
  const timePassed = moment.duration(now.diff(timeStart)).asSeconds();
  return (timePassed / totalSeconds) * 100;
};

const assignProgress = (trutweets = []) => trutweets.map((tweet) => {
  const tweetCopy = Object.assign({}, tweet);
  tweetCopy.progress = getProgress(tweet);
  return tweetCopy;
});

module.exports = {
  add24Hours,
  getProgress,
  assignProgress,
};
