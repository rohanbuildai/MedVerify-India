const express = require('express');
const router = express.Router();
const {
  submitReport, getAllReports, getMyReports, getReport,
  updateReportStatus, upvoteReport, getPublicReports, getReportStats
} = require('../controllers/reportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report-${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter
});

// Public
router.get('/public', getPublicReports);
router.get('/stats', getReportStats);

// Protected
router.post('/', protect, upload.array('images', 3), submitReport);
router.get('/my', protect, getMyReports);
router.get('/:id', protect, getReport);
router.post('/:id/upvote', protect, upvoteReport);

// Admin only
router.get('/', protect, authorize('admin'), getAllReports);
router.put('/:id/status', protect, authorize('admin'), updateReportStatus);

module.exports = router;
