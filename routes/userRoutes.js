const express = require('express');
const router = express.Router();
const { check, validationResult, oneOf } = require('express-validator');

const userController = require('../controllers/userControllers');
const verifyToken = require('../middlewares/auth');

//users/register
router.post(
  '/register',
  [
    check('email').isEmail().withMessage('Must be a valid email'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at lest 6 characters'),
    check('username').notEmpty().withMessage('Username cannot be emtpy'),
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

router.get('/:id', verifyToken, userController.getUser);

router.put(
  '/:id',
  verifyToken,
  [
    oneOf([
      check('username').notEmpty().withMessage('Username cannot be empty'),
      check('name').notEmpty().withMessage('Name cannot be empty')
    ])
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

router.delete('/:id', verifyToken, userController.deleteUser)

module.exports = router;
