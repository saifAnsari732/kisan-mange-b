const cloudinary = require('../config/cloudinary');
const Document = require('../models/Document');

// ✅ Upload multiple documents (max 6)
const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let files = req.files.files;

    if (!Array.isArray(files)) {
      files = [files];
    }

    if (files.length > 6) {
      return res.status(400).json({ message: 'Max 6 files allowed' });
    }

    const uploadedDocs = [];

    for (let file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'employee_documents'
      });

      const doc = await Document.create({
        employeeId: req.user.employeeId,
        name: file.name,
        url: result.secure_url,
        public_id: result.public_id
      });

      uploadedDocs.push(doc);
    }

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get my documents
const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({
      employeeId: req.user.employeeId
    }).sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete document
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // delete from cloudinary
    await cloudinary.uploader.destroy(doc.public_id);

    await doc.deleteOne();

    res.json({ message: 'Deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocuments,
  getMyDocuments,
  deleteDocument
};