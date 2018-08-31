const express = require('express');
const Helper = require('./helpers');
const Vote = require('../models/vote');

const router = express.Router();

router.route('/votes').get((req, res) => {
  const params = Helper.handleParams(req.query);
  Helper.searchByParams(Vote, params, res);
}).post((req, res) => {
  const {
    _p_user,
    _p_tweet,
    upvote,
    downvote,
  } = req.body;
  const vote = new Vote({
    _p_user,
    _p_tweet,
    upvote,
    downvote,
    dateCreated: new Date(),
  });

  vote.save((err) => {
    Helper.handleRequest(res, err, vote);
  });
}).delete((req, res) => {
  const { _p_user, _p_tweet } = req.body;
  Vote.findOne({ _p_user, _p_tweet })
    .remove().exec((err, vals) => {
      Helper.handleRequest(res, err, vals);
    });
});

module.exports = router;
