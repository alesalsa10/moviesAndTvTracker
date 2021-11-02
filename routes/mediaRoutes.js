const express = require('express');
const router = express.Router();

const mediaControllers = require('../controllers/mediaControllers');
const auth = require('../middlewares/auth');

//no need to be signed in to get media
router.get('/getById/:mediaType/:id', mediaControllers.getMediaById);
router.get('/:mediaType/:category', mediaControllers.getMediaByCategories);
router.get('/search/all/:searchQuery', mediaControllers.searchMedia);

module.exports = router;
