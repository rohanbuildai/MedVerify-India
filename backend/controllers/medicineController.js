const Medicine = require('../models/Medicine');
const Verification = require('../models/Verification');
const { AppError } = require('../middleware/errorHandler');
const QRCode = require('qrcode');

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Public
exports.searchMedicines = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return next(new AppError('Search query must be at least 2 characters', 400));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchFilter = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { manufacturer: { $regex: q, $options: 'i' } }
      ]
    };

    if (category) searchFilter.category = category;

    const total = await Medicine.countDocuments(searchFilter);
    const medicines = await Medicine.find(searchFilter)
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: medicines
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get medicine by ID or medicineId
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    let medicine;

    // Try medicineId first (MED-xxx format)
    if (id.startsWith('MED-')) {
      medicine = await Medicine.findOne({ medicineId: id, isActive: true });
    } else {
      medicine = await Medicine.findOne({ 
        $or: [{ _id: id }, { medicineId: id }],
        isActive: true 
      });
    }

    if (!medicine) {
      return next(new AppError('Medicine not found in our database', 404));
    }

    // Log verification
    await Verification.create({
      verifiedBy: req.user ? req.user._id : null,
      medicine: medicine._id,
      searchQuery: id,
      result: medicine.isFlaggedAsFake ? 'flagged' : 'authentic',
      location: req.body.location || {},
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Increment verification count
    await Medicine.findByIdAndUpdate(medicine._id, { $inc: { verificationCount: 1 } });

    // Generate QR URL
    const qrData = `${process.env.CLIENT_URL}/verify/${medicine.medicineId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      data: {
        ...medicine.toObject(),
        qrCode
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all medicines (paginated)
// @route   GET /api/medicines
// @access  Public
exports.getAllMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, flagged } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (flagged === 'true') filter.isFlaggedAsFake = true;

    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .select('name brand manufacturer category dosageForm riskLevel isFlaggedAsFake reportCount verificationCount medicineId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: medicines
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add medicine (admin/pharmacist)
// @route   POST /api/medicines
// @access  Private (admin, pharmacist)
exports.addMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create({
      ...req.body,
      addedBy: req.user._id,
      isVerified: req.user.role === 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: medicine
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update medicine (admin)
// @route   PUT /api/medicines/:id
// @access  Private (admin)
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// @desc    Get flagged medicines (high risk)
// @route   GET /api/medicines/flagged
// @access  Public
exports.getFlaggedMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      $or: [{ isFlaggedAsFake: true }, { riskLevel: { $in: ['high', 'critical'] } }],
      isActive: true
    })
    .select('name brand manufacturer category riskLevel reportCount medicineId')
    .sort({ reportCount: -1 })
    .limit(50);

    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    next(err);
  }
};

// @desc    Get medicine stats
// @route   GET /api/medicines/stats
// @access  Public
exports.getMedicineStats = async (req, res, next) => {
  try {
    const [total, flagged, highRisk, categoryStats] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isFlaggedAsFake: true, isActive: true }),
      Medicine.countDocuments({ riskLevel: { $in: ['high', 'critical'] }, isActive: true }),
      Medicine.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: { total, flagged, highRisk, categoryStats }
    });
  } catch (err) {
    next(err);
  }
};
