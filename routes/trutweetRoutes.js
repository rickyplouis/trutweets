const express = require('express');
const Trutweet = require('../models/trutweet');

const router = express.Router();
const Helper = require('./helpers');

router.route('/trutweets').get((req, res) => {
  const params = Helper.handleParams(req.query);
  if (req.query._id) {
    Helper.searchById(Trutweet, req.query._id, res);
  } else {
    Helper.searchByParams(Trutweet, params, res);
  }
}).post((req, res) => {
  const {
    text,
    creator,
    timeStart,
    timeEnd,
    upvotes,
    downvotes,
    status,
  } = req.body;

  const trutweetBody = new Trutweet({
    text,
    creator,
    timeStart,
    timeEnd,
    upvotes,
    downvotes,
    status,
  });

  trutweetBody.save((err) => {
    Helper.handleRequest(res, err, trutweetBody);
  });
}).put((req, res) => Trutweet.findById(req.query._id).exec((err, comment) => {
  const truTweetCopy = comment;
  if (truTweetCopy) {
    if (req.body.text) {
      truTweetCopy.text = req.body.text;
    }

    if (req.body.upvotes) {
      truTweetCopy.upvotes = req.body.upvotes;
    }

    if (req.body.downvotes) {
      truTweetCopy.downvotes = req.body.downvotes;
    }

    if (req.body.status) {
      truTweetCopy.status = req.body.status;
    }

    truTweetCopy.save((saveErr) => {
      Helper.handleRequest(res, saveErr, comment);
    });
  } else {
    res.send(err);
  }
}));

module.exports = router;
