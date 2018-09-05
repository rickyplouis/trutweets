const createDOMPurify = require('dompurify');

const renderIcon = (selectedAnnotation = { upvotes: [], downvotes: [] }, currentUser = '', isLikeIcon) => {
  const { upvotes, downvotes } = selectedAnnotation;
  if (isLikeIcon) {
    return upvotes.indexOf(currentUser) >= 0 ? 'like' : 'like-o';
  }
  return downvotes.indexOf(currentUser) >= 0 ? 'dislike' : 'dislike-o';
};

const sanitize = input => createDOMPurify.sanitize(input);

module.exports = {
  renderIcon,
  sanitize,
};
