const express = require('express');
const router = express.Router();
const { check, validationResult, oneOf } = require('express-validator');

const userController = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser');

//testing new computer git and github connection

//users/register
router.post(
  '/register',
  [
    check('email').isEmail().withMessage('Must be a valid email'),
    check('password')
      .isLength({ min: 8, max: 15 })
      .withMessage("your password should have min and max length between 8-15")
      .matches(/\d/)
      .withMessage("your password should have at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("your password should have at least one sepcial character"),

    //.isLength({ min: 6 })
    //.withMessage('Password must be at lest 6 characters'),
    check('username').notEmpty().withMessage('Username cannot be emtpy'),
    check('name').notEmpty().withMessage('Name cannot be emtpy'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.register
);

router.post(
  '/signIn',
  [
    oneOf([
      check('username').notEmpty().withMessage('Username cannot be empty'),
      check('email').isEmail().withMessage('Type a valid email'),
    ]),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 charcaters long'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.signIn
);

router.get('/:id', auth, userController.getUser);

router.put(
  '/:id',
  auth,
  isLoggedInSameUser,
  [
    oneOf([
      check('username').notEmpty().withMessage('Username cannot be empty'),
      check('name').notEmpty().withMessage('Name cannot be empty'),
    ]),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.editUser
);

router.delete('/:id', auth, isLoggedInSameUser, userController.deleteUser);

//still need to check body for these 2 methods
router.post(
  '/forgotPassword',
  [check('email').isEmail().withMessage('Must be a valid email')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.forgotPassword
);

router.post(
  '/resetPassword/:userId/:token',
  [
    check('password')
      .isLength({ min: 8, max: 15 })
      .withMessage('your password should have min and max length between 8-15')
      .matches(/\d/)
      .withMessage('your password should have at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('your password should have at least one sepcial character'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.resetPassword
);

module.exports = router;
