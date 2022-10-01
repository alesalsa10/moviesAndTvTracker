const express = require('express');
const router = express.Router();

const configController = require('../controllers/mediaApiConfigController');

router.get('/', configController.getConfiguration);

module.exports = router;