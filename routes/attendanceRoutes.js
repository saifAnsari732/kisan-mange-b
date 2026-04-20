const express = require('express');
const router = express.Router();
const {
  markAttendance,
  bulkMarkAttendance,
  getAllAttendance,
  getMyAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

// Employee routes
router.get('/me', protect, getMyAttendance);

// Admin routes
router.get('/', protect, adminOnly, getAllAttendance);
router.post('/', protect, adminOnly, markAttendance);
router.post('/bulk', protect, adminOnly, bulkMarkAttendance);
router.get('/stats/overview', protect, adminOnly, getAttendanceStats);
router.put('/:id', protect, adminOnly, updateAttendance);
router.delete('/:id', protect, adminOnly, deleteAttendance);

module.exports = router;
