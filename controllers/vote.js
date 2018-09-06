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
    if (streak === 1) {
      points = 10;
    }
    if (streak === 2) {
      points = 20;
    }
    if (streak === 3) {
      points = 50;
    }
  }
  return points;
};

module.exports = {
  renderIcon,
  putVote,
  getPoints,
};
