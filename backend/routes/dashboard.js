const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Report = require('../models/Report');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const Verification = require('../models/Verification');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (admin)
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMedicines,
      flaggedMedicines,
      totalReports,
      pendingReports,
      actionTakenReports,
      recentReports,
      recentSignups,
      totalVerifications,
      reportsByDay,
      topStates
    ] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isFlaggedAsFake: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'action_taken' }),
      Report.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Verification.countDocuments(),
      Report.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Report.aggregate([
        { $group: { _id: '$purchaseLocation.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMedicines,
        flaggedMedicines,
        totalReports,
        pendingReports,
        actionTakenReports,
        recentReports,
        recentSignups,
        totalVerifications,
        reportsByDay,
        topStates
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get public stats (for homepage)
// @route   GET /api/dashboard/public-stats
// @access  Public
router.get('/public-stats', async (req, res, next) => {
  try {
    const [totalReports, actionTaken, flaggedMedicines, totalVerifications] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'action_taken' }),
      Medicine.countDocuments({ isFlaggedAsFake: true }),
      Verification.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: { totalReports, actionTaken, flaggedMedicines, totalVerifications }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
