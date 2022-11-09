import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';

import auth from '../middlewares/auth';
import checkVerification from '../middlewares/checkVerification';

import commentControllers from '../controllers/commentsControllers';

import { Request, Response, NextFunction } from 'express';
import getCommentsMiddleware from '../middlewares/getComments';

router.post(
  '/:mediaType/:id',
  auth,
  checkVerification,
  [check('text').notEmpty().withMessage('Text must exist')],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.createComment
);

router.post(
  '/:mediaType/:id/reply',
  auth,
  checkVerification,
  [
    check('text').notEmpty().withMessage('Text must exist'),
    check('parentCommentId')
      .notEmpty()
      .withMessage('Parent Comment Id must exist'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.replyToComment
);

router.put(
  '/edit/:commentId',
  auth,
  checkVerification,
  //isLoggedInSameUser,
  [
    check('text')
      .notEmpty()
      .withMessage('Text must exist')
      .not()
      .equals('[Deleted]')
      .withMessage(`Text cannot be equal to [Deleted]`),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.editComment
);

router.put(
  '/vote/:commentId',
  auth,
  checkVerification,
  [check('isUpvote').isBoolean().withMessage('isUpvote must be true or false')],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  commentControllers.vote
);

router.delete(
  '/delete/:commentId',
  auth,
  checkVerification,
  commentControllers.deleteComment
);

router.get(
  '/:mediaType/:id',
  getCommentsMiddleware,
  commentControllers.getComments);

export default router;
