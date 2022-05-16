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

  //Determines if there's a logged in user
  if (req.isAuthenticated()) {
    isLoggedIn = true;
  }
  else {
    isLoggedIn = false;
  }

  //see if user is a member
  let membershipButtonText;
  if (req.user !== undefined && req.user.membershipStatus === true) {
    membershipButtonText = 'Leave'
  }
  else {
    membershipButtonText = 'Join';
    if (req.user !== undefined && req.user.admin === false) {
      messagesArray.forEach(element => element.author = 'unknown');
    }
  }

  let isAdmin = false;
  if (req.user !== undefined && req.user.admin === true) {
    isAdmin = true;
  }

  res.render('index', { title: 'Members-Only', messages: messagesArray, isLoggedIn: isLoggedIn, membershipButtonText: membershipButtonText, isAdmin: isAdmin });
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

    let admin
    if (typeof req.body.admin === undefined) {
      admin = false;
    }
    else {
      admin = true;
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
      admin: admin,
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


//Join membership
router.get('/join', (req, res, next) => {
  res.render('join', { isMember: req.user.membershipStatus });
});

router.post('/join', async (req, res, next) => {

  //Note this is could be exploited bc if they found a way to make 'secret-password' undefined, they could become a member when really they should only become a member when they enter the correct password
  if (typeof req.body['secret-password'] === undefined || req.body['secret-password'] === 'membersonly1') {
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


//Create Message
router.get('/newmessage', (req, res, next) => {
  res.render('create-message');
});

router.post('/newmessage', async (req, res, next) => {
  const newMessage = new Message(
    {
      title: req.body.title,
      timestamp: new Date(),
      content: req.body.content,
      author: req.user.username,
    }
  );

  await newMessage.save();
  res.redirect('/');
});

router.post('/delete-message', async (req, res, next) => {
  console.log(req.body.messageid);

  if (req.user.admin === true) {
    await Message.findByIdAndRemove(req.body.messageid).exec();
    return res.redirect('/');
  }
  else {
    return res.json('you are not an admin');
  }
  res.redirect('/')
})
module.exports = router;
