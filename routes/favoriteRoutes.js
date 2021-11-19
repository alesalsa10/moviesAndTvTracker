const express = require('express');
const router = express.Router();
const favoriteControllers = require('../controllers/favoritesControllers');
const auth = require('../middlewares/auth');
const isLoggedInSameUser = require('../middlewares/isLoggedInSameUser.js');

router.post(
  '/new/movie/:externalId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.addMovieToFavorites
);

router.post(
  '/new/Tv/:externalId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.addTvToFavorites
);

router.post(
  '/new/book/:externalId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.addBookToFavorites
);

router.get(
  '/all',
  auth,
  isLoggedInSameUser,
  favoriteControllers.getAllFavorites
);

router.delete(
  '/delete/movie/:bookmarkId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.removeMovieFromFavorites
)

router.delete(
  '/delete/tv/:bookmarkId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.removeTvFromFavorites
);

router.delete(
  '/delete/book/:bookmarkId',
  auth,
  isLoggedInSameUser,
  favoriteControllers.removeBookFromFavorites
);

module.exports = router