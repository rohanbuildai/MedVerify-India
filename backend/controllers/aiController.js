const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzePackaging } = require('../utils/gemini');
const Medicine = require('../models/Medicine');
const { AppError } = require('../middleware/errorHandler');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/ai-temp';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `ai-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image file'), false);
    }
    cb(null, true);
  }
}).single('image');

// @desc    Analyze medicine packaging image
// @route   POST /api/medicines/ai-analyze
// @access  Public
exports.aiAnalyze = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(new AppError(err.message, 400));
    if (!req.file) return next(new AppError('Please upload an image', 400));

    try {
      // Find a matching medicine (this is a simplified logic, usually we'd use something like OCR first)
      const medicineId = req.body.medicineId || req.query.medicineId;
      let medicine = null;
      
      if (medicineId) {
        medicine = await Medicine.findById(medicineId);
      } else {
        // Fallback: search for a common medicine if no ID provided
        medicine = await Medicine.findOne({ name: /Crocin/i }); 
      }

      const results = await analyzePackaging(req.file.path, medicine || { name: 'Generic Medicine' });

      // Clean up temp file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        medicine: medicine,
        analysis: results
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError(error.message || 'AI Analysis failed', 500));
    }
  });
};
