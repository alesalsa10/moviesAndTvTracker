const express = require('express');
const router = express.Router();

const peopleRouter = require('../controllers/peopleControllers');

router.get('/:personId', peopleRouter.getPersonById);
router.get('/:personId/:mediaType', peopleRouter.getCredits);
router.get('/person/popular', peopleRouter.getPopular)

module.exports = router;