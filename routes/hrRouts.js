
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { get_me, updateMyProfile } = require('../controllers/hrControler');

router.get('/profile', protect, adminOnly, get_me);
router.put('/update/profile',protect, updateMyProfile);

module.exports = router;