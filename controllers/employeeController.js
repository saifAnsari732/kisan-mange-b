const Employee = require('../models/Employee');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

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
// controllers/employeeController.js

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
      password,
      bankName,
      accountNo,
      ifsc
    } = req.body;

    // 1. Validate required fields
    const requiredFields = ['employeeId', 'name', 'role', 'department', 'mobileNumber', 'emailId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // 2. Check if employee already exists in Employee model
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // 3. Check if employee already exists in User model
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee ID already exists in user account' });
    }

    // 4. Check if email already exists
    const existingEmail = await Employee.findOne({ emailId });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email ID already exists' });
    }

    // 5. Create User account first
    const user = await User.create({
      employeeId,
      password: password || 'password123',
      role: 'employee',
      name: name
    });

    if (!user) {
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    // 6. Create Employee with userId reference
    const employee = await Employee.create({
      employeeId,
      userId: user._id,
      name,
      fatherName: fatherName || '',
      role,
      department,
      headQuarter: headQuarter || '',
      dateOfJoining: dateOfJoining || null,
      dateOfBirth: dateOfBirth || null,
      reportingManager: reportingManager || '',
      cugNumber: cugNumber || '',
      mobileNumber,
      emailId,
      officialEmailId: officialEmailId || emailId,
      address: address || '',
      salary: salary || 0,
      bankName: bankName || '',
      accountNo: accountNo || '',
      ifsc: ifsc || ''
    });

    // 7. Return populated employee data
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', '-password');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee
    });

  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a unique value.` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to create employee' 
    });
  }
};
// @desc    Update employee (HR/Admin)
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check for duplicate employeeId (if trying to change)
    if (updateData.employeeId && updateData.employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ 
        employeeId: updateData.employeeId,
        _id: { $ne: id }
      });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    // Check for duplicate email
    if (updateData.emailId && updateData.emailId !== employee.emailId) {
      const existingEmail = await Employee.findOne({
        emailId: updateData.emailId,
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email ID already exists' });
      }
    }

    // Prepare update data - remove undefined values
    const updateFields = {
      employeeId: updateData.employeeId || employee.employeeId,
      name: updateData.name || employee.name,
      fatherName: updateData.fatherName !== undefined ? updateData.fatherName : employee.fatherName,
      role: updateData.role || employee.role,
      department: updateData.department || employee.department,
      headQuarter: updateData.headQuarter !== undefined ? updateData.headQuarter : employee.headQuarter,
      dateOfJoining: updateData.dateOfJoining || employee.dateOfJoining,
      dateOfBirth: updateData.dateOfBirth || employee.dateOfBirth,
      reportingManager: updateData.reportingManager !== undefined ? updateData.reportingManager : employee.reportingManager,
      cugNumber: updateData.cugNumber !== undefined ? updateData.cugNumber : employee.cugNumber,
      mobileNumber: updateData.mobileNumber || employee.mobileNumber,
      emailId: updateData.emailId || employee.emailId,
      officialEmailId: updateData.officialEmailId !== undefined ? updateData.officialEmailId : employee.officialEmailId,
      address: updateData.address !== undefined ? updateData.address : employee.address,
      salary: updateData.salary !== undefined ? updateData.salary : employee.salary,
      bankName: updateData.bankName !== undefined ? updateData.bankName : employee.bankName,
      accountNo: updateData.accountNo !== undefined ? updateData.accountNo : employee.accountNo,
      ifsc: updateData.ifsc !== undefined ? updateData.ifsc : employee.ifsc
    };

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    // Update corresponding User model
    if (employee.userId) {
      const userUpdateData = {
        employeeId: updatedEmployee.employeeId,
        name: updatedEmployee.name
      };
      
      // Only update password if provided and not default
      if (updateData.password && updateData.password !== 'password123' && updateData.password !== '') {
        userUpdateData.password = updateData.password;
      }
      
      await User.findByIdAndUpdate(
        employee.userId,
        userUpdateData,
        { new: true }
      );
    }

    // Return populated employee
    const populatedEmployee = await Employee.findById(id)
      .populate('userId', '-password');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: populatedEmployee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to update employee' });
  }
};

// @desc    Update my profile (limited fields)
// @route   PUT /api/employees/me/profile
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    console.log("adjnfkasjdfn")
    const { address, mobileNumber, bankName, accountNo, ifsc } = req.body;

    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ text fields update
    if (address) employee.address = address;
    if (mobileNumber) employee.mobileNumber = mobileNumber;
    if (bankName) employee.bankName = bankName;
    if (accountNo) employee.accountNo = accountNo;
    if (ifsc) employee.ifsc = ifsc;

    // ✅ IMAGE UPLOAD
    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage;

      // ❌ old image delete (important)
      if (employee.cloudinaryId) {
        await cloudinary.uploader.destroy(employee.cloudinaryId);
      }

      // ✅ upload new image
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "employee_profiles",
        width: 300,
        crop: "scale"
      });

      employee.profileImage = result.secure_url;
      employee.cloudinaryId = result.public_id;
    }

    await employee.save();

    res.json(employee);

  } catch (error) {
    console.error(error);
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
