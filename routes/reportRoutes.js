// routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { generateEmployeeReport } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/employee/:id', protect, adminOnly, generateEmployeeReport);

module.exports = router;