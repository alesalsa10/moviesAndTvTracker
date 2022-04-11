const express = require('express');
const router = express.Router();
const favoriteControllers = require('../controllers/favoritesControllers');
const auth = require('../middlewares/auth');

router.put(
  '/movie/:externalId',
  auth,
  favoriteControllers.toggleMovieFavorite
);

router.put(
  '/tv/:externalId',
  auth,
  favoriteControllers.toggleTvFavorite
);

router.put(
  '/book/:externalId',
  auth,
  //isLoggedInSameUser,
  favoriteControllers.toggleBookFavorite
);

router.get(
  '/all',
  auth,
  //isLoggedInSameUser,
  favoriteControllers.getAllFavorites
);


module.exports = router