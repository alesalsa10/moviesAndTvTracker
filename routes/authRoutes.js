const express = require('express');
const router = express.Router();
const { check, validationResult, oneOf } = require('express-validator');

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post(
  '/register',
  [
    check('email').isEmail().withMessage('Must be a valid email'),
    check('username')
      .notEmpty()
      .isLength({ min: 3, max: 25 })
      .withMessage('Username must be between 3 and 25 characters'),
    check('password')
      .isStrongPassword()
      .withMessage(
        'Password must be 8 or more characters, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol'
      ),
    check('name').notEmpty().withMessage('Name is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.register
);

router.post(
  '/signin',
  [
    check('email').isEmail().withMessage('Enter a valid email'),
    check('password').isLength({ min: 8 }).withMessage('Invalid credentials'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.signIn
);

router.get('/signout', authController.signout);

router.post(
  '/changePassword',
  auth,
  [
    check('currentPassword')
      .notEmpty()
      .withMessage('Current password required'),
    check('newPassword')
      .isStrongPassword()
      .withMessage(
        'Password must be 8 or more characters, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol'
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.changePassword
);

router.post(
  '/changeEmail',
  auth,
  [
    check('currentPassword')
      .notEmpty()
      .withMessage('Current password required'),
    check('email').isEmail().withMessage('Enter a valid email'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.changeEmail
);

router.post('/verifyEmail/:token', authController.verifyEmail);

router.post(
  '/verify/resendEmail',
  [check('email').isEmail().withMessage('Must be a valid email')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.resendVerificationEmail
);

//this will just send the link to reset the password
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
  authController.forgotPassword
);

router.post(
  '/resetPassword/:token',
  [
    check('password')
      .isStrongPassword()
      .withMessage(
        'Password must be 8 or more characters, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol'
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  authController.resetPassword
);

router.get('/refresh', authController.refreshToken);

module.exports = router;
