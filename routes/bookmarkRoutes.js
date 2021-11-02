const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const mediaControllers = require('../controllers/bookmarksControllers');
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');

// media/new/userId
router.post(
  '/new',
  auth,
  isLoggedInSameUser,
  [check('externalId').notEmpty().withMessage('External id must exist')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  mediaControllers.addBookmark
);

router.get('/all', auth, isLoggedInSameUser, mediaControllers.getAllBookmarks);
router.get(
  '/:mediaType',
  auth,
  isLoggedInSameUser,
  mediaControllers.getAllBookmarkedByCategory
);
router.delete(
  '/:bookmarkId',
  auth,
  isLoggedInSameUser,
  mediaControllers.deleteBookmark
);

module.exports = router;
