const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');
const booksControllers = require('../controllers/bookControllers');


router.get('/search', booksControllers.searchBook);

router.post('/recommendation', booksControllers.moviesBasedOnBook);

router.get('/:bookId', booksControllers.getBookById);

router.get('/genre/:genre', booksControllers.getBooksByGenre);

router.get('/byAuthor/:author', booksControllers.booksByAuthor);

router.get('/newYorkTimes/bestSellers', booksControllers.getBestSellers);

router.get('/isbn/:isbn', booksControllers.getBookByIsbn);

module.exports = router;
