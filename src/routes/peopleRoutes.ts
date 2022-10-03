import express from 'express';
const router = express.Router();

import peopleRouter from '../controllers/peopleControllers';

router.get('/:personId', peopleRouter.getPersonById);
router.get('/lists/popular', peopleRouter.getPopular);
router.get('/:personId/:mediaType', peopleRouter.getCredits);

export default router;
