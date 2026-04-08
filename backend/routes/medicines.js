const express = require('express');
const router = express.Router();
const {
  searchMedicines, getMedicine, getAllMedicines,
  addMedicine, updateMedicine, getFlaggedMedicines, getMedicineStats
} = require('../controllers/medicineController');
const { aiAnalyze } = require('../controllers/aiController');
const { cdscoLookup } = require('../controllers/cdscoController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/search', searchMedicines);
router.get('/flagged', getFlaggedMedicines);
router.get('/stats', getMedicineStats);
router.get('/', getAllMedicines);
router.post('/ai-analyze', aiAnalyze);
router.get('/cdsco-lookup/:batchNumber', cdscoLookup);
router.get('/:id', optionalAuth, getMedicine);

// Protected routes (admin/pharmacist)
router.post('/', protect, authorize('admin', 'pharmacist'), addMedicine);
router.put('/:id', protect, authorize('admin'), updateMedicine);

module.exports = router;
