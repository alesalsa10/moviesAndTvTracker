const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');
const booksControllers = require('../controllers/bookControllers');

router.get('/:bookId', booksControllers.getBookById);

router.get('/genre/:genre', booksControllers.getBooksByGenre);

router.get('/recommendation/:bookId', booksControllers.doesBookHaveMedia);

router.get('/search/:searchQuery', booksControllers.searchBook);

router.get('/newYorkTimes/bestSellers', booksControllers.getBestSellers);

router.get('/isbn/:isbn', booksControllers.getBookByIsbn);

module.exports = router;
