var express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
var router = express.Router();
const { validatePassword, generatePassword } = require('../utilities/password');
const { body, validationResult } = require('express-validator');
const passport = require('passport')

/* GET home page. */
router.get('/', async function (req, res, next) {

  let isLoggedIn;
  let messagesArray = await Message.find({}).limit(20).exec();

  console.log(req.isAuthenticated())
  if (req.isAuthenticated()) {
    isLoggedIn = true;
  }
  else {
    isLoggedIn = false;
    messagesArray.forEach(element => element.author = 'unknown');
  }

  res.render('index', { title: 'Members-Only', messages: messagesArray, isLoggedIn: isLoggedIn });
});

// Register
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register',
  body('password').isLength({ min: 8 }).withMessage('password length must be at least 8 characters'),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error(`passwords don't match`);
    }
    return true;
  }),
  async function (req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const passwordObject = generatePassword(req.body.password);
    const salt = passwordObject.salt;
    const hash = passwordObject.hash;

    let newUser = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      hash: hash,
      salt: salt,
      membershipStatus: false,
      admin: false,
    });

    await newUser.save();

    res.redirect('/login');
  });


//Login
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failed', successRedirect: '/login-success' }), function (err, req, res, next) {
  if (err) next(err)
})

//Login success/fail
router.get('/login-failed', (req, res) => res.render('login-failed'));
router.get('/login-success', (req, res) => res.render('login-success'));


// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/join', (req, res, next) => {
  res.render('join');
});

router.post('/join', async (req, res, next) => {
  if (req.body['secret-password'] === 'membersonly1') {
    const updatedUser = new User({
      ...req.user,
      membershipStatus: !req.user.membershipStatus,
      _id: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, updatedUser);
    console.log('updated user')
  }
  return res.redirect('/');
});

module.exports = router;
