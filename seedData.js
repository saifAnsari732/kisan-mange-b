require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Data cleared...');

    // Create HR/Admin User
    const hrUser = await User.create({
      employeeId: 'KG001',
      password: 'admin123',
      role: 'hr'
    });

    // Create HR Employee Profile
    await Employee.create({
      employeeId: 'KG001',
      name: 'Rajesh Kumar',
      fatherName: 'Ram Kumar',
      role: 'HR Manager',
      department: 'Sales',
      headQuarter: 'Lucknow HQ',
      dateOfJoining: new Date('2020-01-15'),
      dateOfBirth: new Date('1985-05-20'),
      reportingManager: 'CEO',
      cugNumber: '9876543210',
      mobileNumber: '9876543210',
      emailId: 'rajesh.kumar@kisan.com',
      officialEmailId: 'hr@kisangroup.com',
      address: 'Gomti Nagar, Lucknow, UP',
      salary: 80000,
      userId: hrUser._id
    });

    // Create Sample Employees
    const employees = [
      {
        employeeId: 'KG002',
        name: 'Priya Sharma',
        fatherName: 'Vijay Sharma',
        role: 'Sales Executive',
        department: 'Sales',
        headQuarter: 'Lucknow HQ',
        dateOfJoining: new Date('2021-03-10'),
        dateOfBirth: new Date('1992-08-15'),
        reportingManager: 'Rajesh Kumar',
        cugNumber: '9876543211',
        mobileNumber: '9876543211',
        emailId: 'priya.sharma@kisan.com',
        officialEmailId: 'priya.sharma@kisangroup.com',
        address: 'Hazratganj, Lucknow, UP',
        salary: 35000,
        password: 'employee123'
      },
      {
        employeeId: 'KG003',
        name: 'Amit Verma',
        fatherName: 'Rakesh Verma',
        role: 'Senior Developer',
        department: 'Developer',
        headQuarter: 'Lucknow HQ',
        dateOfJoining: new Date('2019-06-20'),
        dateOfBirth: new Date('1990-12-05'),
        reportingManager: 'Rajesh Kumar',
        cugNumber: '9876543212',
        mobileNumber: '9876543212',
        emailId: 'amit.verma@kisan.com',
        officialEmailId: 'amit.verma@kisangroup.com',
        address: 'Indira Nagar, Lucknow, UP',
        salary: 65000,
        password: 'employee123'
      },
      {
        employeeId: 'KG004',
        name: 'Sneha Gupta',
        fatherName: 'Suresh Gupta',
        role: 'Marketing Manager',
        department: 'Marketing',
        headQuarter: 'Delhi Branch',
        dateOfJoining: new Date('2020-09-01'),
        dateOfBirth: new Date('1988-03-22'),
        reportingManager: 'Rajesh Kumar',
        cugNumber: '9876543213',
        mobileNumber: '9876543213',
        emailId: 'sneha.gupta@kisan.com',
        officialEmailId: 'sneha.gupta@kisangroup.com',
        address: 'Connaught Place, Delhi',
        salary: 55000,
        password: 'employee123'
      },
      {
        employeeId: 'KG005',
        name: 'Rahul Singh',
        fatherName: 'Mahendra Singh',
        role: 'Graphic Designer',
        department: 'Graphic Designer',
        headQuarter: 'Lucknow HQ',
        dateOfJoining: new Date('2022-01-15'),
        dateOfBirth: new Date('1995-07-10'),
        reportingManager: 'Rajesh Kumar',
        cugNumber: '9876543214',
        mobileNumber: '9876543214',
        emailId: 'rahul.singh@kisan.com',
        officialEmailId: 'rahul.singh@kisangroup.com',
        address: 'Aliganj, Lucknow, UP',
        salary: 40000,
        password: 'employee123'
      },
      {
        employeeId: 'KG006',
        name: 'Anjali Yadav',
        fatherName: 'Ramesh Yadav',
        role: 'Content Editor',
        department: 'Editor',
        headQuarter: 'Mumbai Branch',
        dateOfJoining: new Date('2021-11-05'),
        dateOfBirth: new Date('1993-09-18'),
        reportingManager: 'Rajesh Kumar',
        cugNumber: '9876543215',
        mobileNumber: '9876543215',
        emailId: 'anjali.yadav@kisan.com',
        officialEmailId: 'anjali.yadav@kisangroup.com',
        address: 'Andheri, Mumbai, MH',
        salary: 42000,
        password: 'employee123'
      }
    ];

    for (let emp of employees) {
      const user = await User.create({
        employeeId: emp.employeeId,
        password: emp.password,
        role: 'employee'
      });

      await Employee.create({
        ...emp,
        userId: user._id,
        password: undefined
      });
    }

    console.log('Sample data created successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('HR/Admin: KG001 / admin123');
    console.log('Employee: KG002 / employee123');
    console.log('Employee: KG003 / employee123');
    console.log('========================\n');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
