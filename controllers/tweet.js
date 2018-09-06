const Fetch = require('../controllers/fetch');

const getAllTweets = token => new Promise((resolve) => {
  Fetch.getReq('/api/trutweets', token).then((trutweets) => {
    resolve(trutweets);
  });
});


module.exports = {
  getAllTweets,
};
