const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const checkVerification = require('../middlewares/checkVerification');

const commentControllers = require('../controllers/commentsControllers');

router.post(
  '/:mediaType/:id',
  auth,
  checkVerification,
  [
    check('text').notEmpty().withMessage('Text must exist'),
  ],
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
  '/:mediaType/:id/reply',
  auth,
  checkVerification,
  [
    check('text').notEmpty().withMessage('Text must exist'),
    check('parentCommentId')
      .notEmpty()
      .withMessage('Parent Comment Id must exist'),
  ],
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
  //isLoggedInSameUser,
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

router.delete(
  '/delete/:commentId',
  auth,
  checkVerification,
  commentControllers.deleteComment
);

router.get('/:mediaType/:id', commentControllers.getComments);

module.exports = router;
