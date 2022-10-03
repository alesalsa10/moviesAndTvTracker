import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth';
import isLoggedInSameUser from '../middlewares/isLoggedInSameUser.js';
import booksControllers from '../controllers/bookControllers';


router.get('/search', booksControllers.searchBook);

router.post('/recommendation', booksControllers.moviesBasedOnBook);

router.get('/:bookId', booksControllers.getBookById);

router.get('/genre/:genre', booksControllers.getBooksByGenre);

router.get('/byAuthor/:author', booksControllers.booksByAuthor);

router.get('/newYorkTimes/bestSellers', booksControllers.getBestSellers);

router.get('/isbn/:isbn', booksControllers.getBookByIsbn);

export default router;
