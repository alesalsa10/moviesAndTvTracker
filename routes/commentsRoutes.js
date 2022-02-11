const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');
const checkVerification = require('../middlewares/checkVerification');

const commentControllers = require('../controllers/commentsControllers');

router.post(
  '/:mediaType/new',
  auth,
  checkVerification,
  [check('text').notEmpty().withMessage('External id must exist')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.createComment
);

router.post(
  '/:mediaType/reply',
  auth,
  checkVerification,
  [check('text').notEmpty().withMessage('Text must exist')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.replyToComment
);

router.put(
  '/edit/:commentId',
  auth,
  checkVerification,
  isLoggedInSameUser,
  [
    check('text')
      .notEmpty()
      .withMessage('Text must exist')
      .not()
      .equals('[Deleted]')
      .withMessage(`Text cannot be equal to [Deleted]`),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.editComment
);

router.put(
  '/delete/:commentId',
  auth,
  checkVerification,
  isLoggedInSameUser,
  commentControllers.deleteComment
);

module.exports = router;
