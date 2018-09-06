const moment = require('moment');

const add24Hours = date => moment(date).add(24, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a');

const getProgress = (tweet) => {
  let { timeStart, timeEnd } = tweet;
  if (timeStart > timeEnd) {
    return 100;
  }
  const now = moment(new Date());
  timeStart = moment(timeStart);
  timeEnd = moment(timeEnd);
  const duration = moment.duration(timeEnd.diff(timeStart));
  const totalSeconds = duration.asSeconds();
  const timePassed = moment.duration(now.diff(timeStart)).asSeconds();
  return (timePassed / totalSeconds) * 100;
};

const assignProgress = (trutweets = []) => trutweets.map((tweet) => {
  const tweetCopy = Object.assign({}, tweet);
  if (tweet.status === 'inProgress') {
    tweetCopy.progress = getProgress(tweet);
  } else {
    tweetCopy.progress = 100;
  }
  return tweetCopy;
});

module.exports = {
  add24Hours,
  getProgress,
  assignProgress,
};
