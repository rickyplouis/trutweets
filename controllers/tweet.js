const Fetch = require('../controllers/fetch');

const getAllTweets = token => new Promise((resolve) => {
  Fetch.getReq('/api/trutweets', token).then((trutweets) => {
    resolve(trutweets.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart)));
  });
});


module.exports = {
  getAllTweets,
};
