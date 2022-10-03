import express from 'express';
const router = express.Router();

import configController from '../controllers/mediaApiConfigController';

router.get('/', configController.getConfiguration);

export default router;
