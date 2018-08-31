const createDOMPurify = require('dompurify');
const Fetch = require('./fetch');

const getID = (router = {}) => {
  const { query, params } = router;
  if (params && params !== 'undefined' && Object.prototype.hasOwnProperty.call(params, 'id')) {
    return params.id;
  }
  if (query && query !== 'undefined' && Object.prototype.hasOwnProperty.call(query, 'id')) {
    return query.id;
  }
  return '';
};

const getVisibleAnnotations = token => new Promise((resolve, reject) => {
  Fetch.getReq('/api/annotations?visible=true', token).then((annotations) => {
    if (annotations.length === 0) {
      reject(new Error('no annotations'));
    }
    resolve(annotations);
  });
});


const getAllDocs = () => new Promise((resolve, reject) => {
  Fetch.getReq('/api/documents').then((res) => {
    if (res.length === 0) {
      reject(new Error('no documents'));
    }
    resolve(res);
  });
});

const renderIcon = (selectedAnnotation = { upvotes: [], downvotes: [] }, currentUser = '', isLikeIcon) => {
  const { upvotes, downvotes } = selectedAnnotation;
  if (isLikeIcon) {
    return upvotes.indexOf(currentUser) >= 0 ? 'like' : 'like-o';
  }
  return downvotes.indexOf(currentUser) >= 0 ? 'dislike' : 'dislike-o';
};

const sanitize = input => createDOMPurify.sanitize(input);

module.exports = {
  getID,
  getVisibleAnnotations,
  getAllDocs,
  renderIcon,
  sanitize,
};
