const express = require('express');
const router = express.Router();

const peopleRouter = require('../controllers/peopleControllers');

router.get('/:personId', peopleRouter.getPersonById);
router.get('/:personId/:mediaType', peopleRouter.getCredits);

module.exports = router;