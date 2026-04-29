const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  type: {
    type: String, // Aadhaar, PAN, Resume etc
    default: 'Other'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);