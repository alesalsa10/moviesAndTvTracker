import express from 'express';
const router = express.Router();

import mediaControllers from '../controllers/mediaControllers';


//no need to be signed in to get media
router.post('/recommendation', mediaControllers.isMediaBasedOnBook);

router.get('/getById/:mediaType/:id', mediaControllers.getMediaById);
router.get('/search/all', mediaControllers.searchMedia);
router.get('/discover/:mediaType', mediaControllers.filterByGenre);
router.get('/:mediaType/:category', mediaControllers.getMediaByCategories);
router.get('/lists/:mediaType/:listType', mediaControllers.getMediaLists);
router.get('/recommendations/:mediaType/:id', mediaControllers.getRecommendations);
router.get('/tv/:id/season/:seasonNumber', mediaControllers.getSeason);
router.get('/tv/:id/season/:seasonNumber/episode/:episodeNumber', mediaControllers.getEpisode);
router.get('/trending/:mediaType/:timePeriod', mediaControllers.getTrending);


export default router;
