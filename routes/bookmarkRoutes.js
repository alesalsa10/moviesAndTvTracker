const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');


const mediaControllers = require('../controllers/bookmarksControllers');
const auth = require('../middlewares/auth');

// media/new/userId
router.post('/new/:userId', auth, [
    check('mediaType').notEmpty().withMessage('Media must exist'),
    check('externalId').notEmpty().withMessage('External id must exist')
], (req, res, next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
}, mediaControllers.addBookmark)

module.exports = router;