const express = require('express');
const router = express.Router();

const genreController = require('../controllers/genreController');

router.get('/:mediaType/list', genreController.getGenres);

module.exports = router;