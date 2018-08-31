const express = require('express');
const User = require('../models/user');
const Helper = require('./helpers');

const router = express.Router();

router.route('/users').get((req, res) => {
  const params = Helper.handleParams(req.query);
  if (req.query._id) {
    Helper.searchById(User, req.query._id, res);
  } else {
    Helper.searchByParams(User, params, res);
  }
}).put((req, res) => User.findById(req.query._id).exec((err, user) => {
  const userCopy = user;
  const {
    name,
    reputation,
  } = req.body;

  if (userCopy) {
    if (name) {
      userCopy.name = name;
    }

    if (reputation) {
      userCopy.reputation = reputation;
    }
    userCopy.save((saveErr) => {
      Helper.handleRequest(res, saveErr, user);
    });
  }
})).delete((req, res) => {
  User.findOne({ name: req.body.name, email: req.body.email }).remove().exec((err, vals) => {
    Helper.handleRequest(res, err, vals);
  });
});

module.exports = router;
