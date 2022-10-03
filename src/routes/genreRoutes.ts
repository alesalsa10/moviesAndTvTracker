import express from 'express';
const router = express.Router();

import genreController from '../controllers/genreController';

router.get('/:mediaType/list', genreController.getGenres);

export default router;