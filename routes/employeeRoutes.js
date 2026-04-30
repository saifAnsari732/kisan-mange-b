const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  createEmployee,
  updateEmployee,
  updateMyProfile,
  deleteEmployee,
  getDepartmentStats
} = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes (protected)
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile',protect, updateMyProfile);

// Admin routes
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.get('/stats/department', protect, adminOnly, getDepartmentStats);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
