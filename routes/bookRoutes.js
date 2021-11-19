const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');
const booksControllers = require('../controllers/bookControllers');

router.get(
  '/:bookId',
  auth,
  isLoggedInSameUser,
  booksControllers.getBookById
);


module.exports = router