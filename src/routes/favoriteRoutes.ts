import express from 'express';
const router = express.Router();
import favoriteControllers from '../controllers/favoritesControllers';
import auth from '../middlewares/auth';
import checkVerification from '../middlewares/checkVerification';

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

export default router;
