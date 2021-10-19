const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');

const commentControllers = require('../controllers/commentsControllers')


router.post(
  '/new',
  auth,
  isLoggedInSameUser,
  [
    check('mediaType').notEmpty().withMessage('Media must exist'),
    check('text').notEmpty().withMessage('External id must exist'),
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
  '/reply',
  auth,
  isLoggedInSameUser,
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
  commentControllers.replyToComment
);

router.put(
  '/edit',
  auth,
  isLoggedInSameUser,
  [check('text').notEmpty().withMessage('Text must exist')],
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

router.put('/delete', auth, isLoggedInSameUser, commentControllers.deleteComment);


module.exports = router