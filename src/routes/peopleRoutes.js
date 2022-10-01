const express = require('express');
const router = express.Router();

const peopleRouter = require('../controllers/peopleControllers');

router.get('/:personId', peopleRouter.getPersonById);
router.get('/lists/popular', peopleRouter.getPopular);
router.get('/:personId/:mediaType', peopleRouter.getCredits);

module.exports = router;