const Fetch = require('./fetch');

const renderIcon = (selectedAnnotation = { upvotes: [], downvotes: [] }, currentUser = '', isLikeIcon) => {
  const { upvotes, downvotes } = selectedAnnotation;
  if (isLikeIcon) {
    return upvotes.indexOf(currentUser) >= 0 ? 'like' : 'like-o';
  }
  return downvotes.indexOf(currentUser) >= 0 ? 'dislike' : 'dislike-o';
};

const putVote = (body, selectedTweet, token) => {
  Fetch.putReq(`/api/trutweets?_id=${selectedTweet._id}`, body, token);
};

const getPoints = (streak) => {
  let points = 0;
  if (streak > 3) {
    const adjustedStreak = streak % 3;
    if (adjustedStreak === 0) {
      points = 50;
    }
    if (adjustedStreak === 1) {
      points = 10;
    }
    if (adjustedStreak === 2) {
      points = 20;
    }
  } else {
    if (streak === 3) {
      points = 50;
    }
    if (streak === 2) {
      points = 20;
    }
    if (streak === 1) {
      points = 10;
    }
  }
  return points;
};

const getStreak = (user, trutweets) => {
  let streak = 0;
  const copyOfTweets = trutweets.slice()
    .sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
  for (let x = 0; x < copyOfTweets.length; x += 1) {
    const { upvotes, downvotes } = copyOfTweets[x];
    if (upvotes.length > downvotes.length) {
      if (upvotes.indexOf(user) >= 0) {
        streak += 1;
      }
      if (downvotes.indexOf(user) >= 0) {
        return streak;
      }
    }

    if (downvotes.length > upvotes.length) {
      if (downvotes.indexOf(user) >= 0) {
        streak += 1;
      }
      if (upvotes.indexOf(user) >= 0) {
        return streak;
      }
    }
  }
  return streak;
};

module.exports = {
  getStreak,
  renderIcon,
  putVote,
  getPoints,
};
