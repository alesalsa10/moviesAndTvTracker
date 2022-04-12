const express = require('express');
const router = express.Router();
const favoriteControllers = require('../controllers/favoritesControllers');
const auth = require('../middlewares/auth');
const checkVerification = require('../middlewares/checkVerification');

router.put(
  '/movie/:externalId',
  auth,
  checkVerification,
  favoriteControllers.toggleMovieFavorite
);

router.put(
  '/tv/:externalId',
  auth,
  checkVerification,
  favoriteControllers.toggleTvFavorite
);

router.put(
  '/book/:externalId',
  auth,
  checkVerification,
  favoriteControllers.toggleBookFavorite
);

router.get(
  '/all',
  auth,
  checkVerification,
  favoriteControllers.getAllFavorites
);

module.exports = router;
