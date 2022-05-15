var express = require('express');
const User = require('../models/User');
var router = express.Router();
const { validatePassword, generatePassword } = require('../utilities/password');
const { body, validationResult } = require('express-validator');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

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

router.get('/login', function (req, res, next) {
  res.json('congrats, you signed up');
});

module.exports = router;
