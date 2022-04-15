const express = require('express');
const router = express.Router();
const { check, validationResult, oneOf } = require('express-validator');

const userController = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser');

router.get('/:username', userController.getUser);

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

router.put(
  '/upload/:userId',
  auth,
  userController.uploadProfileImage
);

module.exports = router;
