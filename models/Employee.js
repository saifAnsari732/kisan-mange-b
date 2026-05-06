const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    // required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    // required: true,
    trim: true
  },
  fatherName: {
    type: String,
    // required: true,
    trim: true
  },
  role: {
    type: String,
    // required: true,
    trim: true
  },
  department: {
    type: String,
    // required: true,
    // enum: ['Sales', 'Marketing', 'Developer', 'Graphic Designer', 'Editor']
  },
  headQuarter: {
    type: String,
    // required: true,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    // required: true
  },
  dateOfBirth: {
    type: Date,
    // required: true
  },
  reportingManager: {
    type: String,
    // required: true,
    trim: true
  },
  cugNumber: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    // required: true,
    trim: true
  },
  emailId: {
    type: String,
    // required: true,
    trim: true,
    lowercase: true
  },
  officialEmailId: {
    type: String,
    // required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    // required: true
  },
  salary: {
    type: Number,
    // required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bankName: {
    type: String,
  },
  accountNo: {
    type: String,
  },
  ifsc: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  profileImage: {
  type: String, // Cloudinary URL
  default: ""
}
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
