require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
 
// Route imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
  const fileUpload = require('express-fileupload');
// Initialize express
const app = express(); 
  
// Connect to database 
connectDB(); 

app.use(cors({
  origin: ['http://localhost:3000'],
  // origin: ['https://kisan-mange-f.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// file upload
app.use(fileUpload({
  useTempFiles: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', require('./routes/documentRoutes'));
// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'Kisan EMS API is running' });
});
//  ajcbjhc
// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
