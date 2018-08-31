const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const Token = require('../controllers/token');

const config = require('../config');

const { secret, testDB } = config;

mongoose.connect(testDB);


const authRoutes = express.Router();

authRoutes.post('/signup', (req, res) => {
  // Load the bcrypt module
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      password: hash,
      bio: '',
      admin: false,
      titles: [],
      job: '',
      linkedIn: '',
      twitter: '',
      medium: '',
      interest: [],
      experience: 0,
      motivation: [],
      subscribed: false,
      reputation: 0,
      joined: new Date(),
    });

    user.save((err2) => {
      if (err2) {
        throw err2;
      }
      const payload = {
        admin: user.admin,
      };
      Token.createToken(payload, secret).then((token) => {
        res.json({
          success: true,
          user: user.id,
          token,
        });
      });
    });
  });
});

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
authRoutes.post('/authenticate', (req, res) => {
  // find the user
  User.findOne({
    email: req.body.email,
  }, (err, user) => {
    if (err) {
      console.log('err', err);
      throw err;
    }
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      bcrypt.compare(req.body.password, user.password, (err3, passwordMatches) => {
        if (passwordMatches) {
          // if user is found and password is right
          // create a token
          const payload = {
            admin: user.admin,
          };
          Token.createToken(payload, secret).then((token) => {
            res.json({
              success: true,
              message: 'Enjoy your token!',
              user: user.id,
              token,
            });
          });
        } else {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }
      });
    }
  });
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
authRoutes.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.params.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    return jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      }
      // if everything is good, save to request for use in other routes
      req.decoded = decoded;
      return next();
    });
  }
  return res.status(403).send({
    success: false,
    message: 'No token provided.',
  });
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
authRoutes.get('/', (req, res) => {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

authRoutes.get('/check', (req, res) => {
  res.json(req.decoded);
});

module.exports = authRoutes;
