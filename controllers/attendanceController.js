const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Mark attendance (HR/Admin)
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkInTime, checkOutTime, remarks } = req.body;

    // Get employee details
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.checkInTime = checkInTime;
      existingAttendance.checkOutTime = checkOutTime;
      existingAttendance.remarks = remarks;
      existingAttendance.markedBy = req.user.employeeId;

      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: new Date(date),
      status,
      checkInTime,
      checkOutTime,
      remarks,
      markedBy: req.user.employeeId
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk mark attendance (HR/Admin)
// @route   POST /api/attendance/bulk
// @access  Private/Admin
const bulkMarkAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;

    const bulkOps = attendanceData.map(item => ({
      updateOne: {
        filter: { employeeId: item.employeeId, date: new Date(date) },
        update: {
          $set: {
            employeeName: item.employeeName,
            department: item.department,
            status: item.status,
            checkInTime: item.checkInTime,
            checkOutTime: item.checkOutTime,
            remarks: item.remarks,
            markedBy: req.user.employeeId
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOps);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records (HR/Admin)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const { department, startDate, endDate, employeeId } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my attendance records
// @route   GET /api/attendance/me
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { employeeId: req.user.employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private/Admin
const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    let matchStage = {};
    
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (department) {
      matchStage.department = department;
    }

    const stats = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$department',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          leave: {
            $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, departmentStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, markedBy: req.user.employeeId },
      { new: true, runValidators: true }
    );

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAllAttendance,
  getMyAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance
};
