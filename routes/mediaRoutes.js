const express = require('express');
const router = express.Router();

const mediaControllers = require('../controllers/mediaControllers');
const auth = require('../middlewares/auth'); //auth is not needed to view media only to interact with them such as adding to bookmarks or commenting on them

//no need to be signed in to get media
router.get('/getById/:mediaType/:id', mediaControllers.getMediaById);
router.get('/:mediaType/:category', mediaControllers.getMediaByCategories);
router.get('/search/all/:searchQuery', mediaControllers.searchMedia);
router.get('/lists/:mediaType/:listType', mediaControllers.getMediaLists);
router.get('/recommendations/:mediaType/:id', mediaControllers.getRecommendations);
router.get('/tv/season/:id/:seasonNumber', mediaControllers.getSeason);
router.get('/tv/:id/season/:seasonNumber/episode/:episodeNumber', mediaControllers.getEpisode);


module.exports = router;
