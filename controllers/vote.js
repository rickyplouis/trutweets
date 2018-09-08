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
  const adjustedStreak = streak % 3;
  if (streak > 3) {
    if (adjustedStreak === 0) {
      return 50;
    }
    if (adjustedStreak === 1) {
      return 20;
    }
    if (adjustedStreak === 2) {
      return 10;
    }
  }

  if (streak === 3) {
    return 50;
  }
  if (streak === 2) {
    return 20;
  }
  if (streak === 1) {
    return 10;
  }
  return 0;
};

const getStreak = (user, trutweets = []) => {
  let streak = 0;
  trutweets = trutweets.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
  for (let x = 0; x < trutweets.length; x += 1) {
    const { upvotes, downvotes } = trutweets[x];
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

const handleVote = (isUpvote, addingVote, selectedTweet = {}, user) => {
  const voteType = isUpvote ? 'upvotes' : 'downvotes';
  let body = {};
  if (Object.keys(selectedTweet).length > 0) {
    if (addingVote) {
      selectedTweet[voteType].push(user);
    } else {
      const index = selectedTweet[voteType].indexOf(user);
      selectedTweet[voteType].splice(index, 1);
    }
    body = {
      upvotes: selectedTweet.upvotes,
      downvotes: selectedTweet.downvotes,
    };
  }
  return body;
};


module.exports = {
  getStreak,
  handleVote,
  renderIcon,
  putVote,
  getPoints,
};
