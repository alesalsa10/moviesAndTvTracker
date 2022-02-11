const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const mediaControllers = require('../controllers/bookmarksControllers');
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');
const checkVerification = require("../middlewares/checkVerification");



// media/new/userId
router.post(
  '/new',
  auth,
  checkVerification,
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

router.get('/all', auth, checkVerification, mediaControllers.getAllBookmarks);
router.get(
  '/:mediaType',
  auth,
  isLoggedInSameUser,
  mediaControllers.getAllBookmarkedByCategory
);
router.delete(
  '/:bookmarkId',
  auth,
  checkVerification,
  mediaControllers.deleteBookmark
);

module.exports = router;
