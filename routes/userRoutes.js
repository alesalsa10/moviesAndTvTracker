const express = require('express');
const router = express.Router();
const { check, validationResult, oneOf } = require('express-validator');

const userController = require('../controllers/userControllers');
const auth = require('../middlewares/auth');

router.get('/self', auth, userController.getSelf);

router.put(
  '/username/:id',
  auth,
  [
    check('username')
      //.notEmpty()
      .isLength({ min: 3, max: 25 })
      .withMessage('Username must be between 3 and 25 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.editUsername
);

router.put(
  '/name/:id',
  auth,
  [
    check('name')
      //.notEmpty()
      .isLength({ min: 3, max: 25 })
      .withMessage('Name must be between 3 and 25 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  userController.editName
);

router.get('/:username', userController.getUser);

router.delete('/:id', auth, userController.deleteUser);

//router.put('/upload/:userId', auth, userController.uploadProfileImage);

module.exports = router;
