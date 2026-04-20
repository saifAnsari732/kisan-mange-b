const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees (HR/Admin)
// @route   GET /api/employees
// @access  Private/Admin
const getAllEmployees = async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = { isActive: true };

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query).select('-userId').sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-userId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user is accessing their own data or is admin
    if (req.user.role === 'employee' && employee.employeeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my profile
// @route   GET /api/employees/me/profile
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.user.employeeId }).select('-userId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee (HR/Admin)
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      fatherName,
      role,
      department,
      headQuarter,
      dateOfJoining,
      dateOfBirth,
      reportingManager,
      cugNumber,
      mobileNumber,
      emailId,
      officialEmailId,
      address,
      salary,
      password
    } = req.body;

    // Check if employee already exists
    const employeeExists = await Employee.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Create user account
    const user = await User.create({
      employeeId,
      password: password || 'password123', // Default password
      role: 'employee'
    });

    // Create employee
    const employee = await Employee.create({
      employeeId,
      name,
      fatherName,
      role,
      department,
      headQuarter,
      dateOfJoining,
      dateOfBirth,
      reportingManager,
      cugNumber,
      mobileNumber,
      emailId,
      officialEmailId,
      address,
      salary,
      userId: user._id
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee (HR/Admin)
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-userId');

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update my profile (limited fields)
// @route   PUT /api/employees/me/profile
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const { address, mobileNumber } = req.body;

    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only allow updating specific fields
    if (address) employee.address = address;
    if (mobileNumber) employee.mobileNumber = mobileNumber;

    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee (HR/Admin)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete
    employee.isActive = false;
    await employee.save();

    // Deactivate user account
    await User.findOneAndUpdate(
      { employeeId: employee.employeeId },
      { isActive: false }
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department statistics
// @route   GET /api/employees/stats/department
// @access  Private/Admin
const getDepartmentStats = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalSalary: { $sum: '$salary' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  createEmployee,
  updateEmployee,
  updateMyProfile,
  deleteEmployee,
  getDepartmentStats
};
