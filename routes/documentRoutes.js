const express = require('express');
const router = express.Router();

const {
  uploadDocuments,
  getMyDocuments,
  deleteDocument
} = require('../controllers/documentController');

const { protect } = require('../middleware/auth');

router.post('/upload', protect, uploadDocuments);
router.get('/my', protect, getMyDocuments);
router.delete('/:id', protect, deleteDocument);

module.exports = router;