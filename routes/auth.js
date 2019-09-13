/* eslint-disable no-console */
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const bcryptSalt = 10;
const router = express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const checkIfLoggedIn = require('../middlewares/auth');

/* Get Sign up page */
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

/* Create a User */
router.post('/signup', (req, res, next) => {
  const { userEmail, password } = req.body;

  /* Form validation */
  if (userEmail !== '' || password !== '') {
    User.findOne({ userEmail })
      .then((email) => {
        if (email) {
          console.log('this email already exists');
          res.render('auth/signup', { error: 'This email is already registered.' });
        } else {
          console.log('email does not exist', email);
          /* Password encryptation */
          const salt = bcrypt.genSaltSync(bcryptSalt);
          const hashedPassword = bcrypt.hashSync(password, salt);
          /* New user */
          User.create({ userEmail, hashedPassword })
            .then(() => {
              console.log('new user has been created');
              res.redirect('/');
            })
            .catch((error) => {
              throw error;
            });
        }
      })
      .catch((error) => {
        console.log(error);
        res.render('auth/signup', { error: 'error try again' });
      });
  } else {
    res.render('auth/signup', { error: 'all the fields must be filled' })
  }
});

/* Get Login page */
router.get('/login', (req, res) => {
  res.render('auth/login');
});


router.post('/login', (req, res, next) => {
  const { userEmail, password } = req.body;
  if (userEmail !== '' && password !== '') {
    User.findOne({ userEmail })
      .then((user) => {
        if (user) {
          if (bcrypt.compareSync(password, user.hashedPassword)) {
            // password valido
            // guardo la session
            req.session.currentUser = user;
            res.redirect('/');
          } else {
            // password invalido
            res.render('auth/login', { error: 'Wrong email or password.' });
          }
        } else {
          res.redirect('/signup', { error: 'User does not exist, please sign up.' });
        }
      })
      .catch(() => {
        res.render('auth/login', { error: 'There was an error. Please try again.' });
      });
  } else {
    res.render('auth/login', { error: 'All fields must be filled' });
  }
});

/* Get logout page */
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    if (err) {
      next(err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
