const express = require('express');
const router = express.Router();

const mediaControllers = require('../controllers/mediaControllers');
const auth = require('../middlewares/auth');

//no need to be signed in to get media
router.get('/:id', auth, mediaControllers.getMediaById);

module.exports = router;