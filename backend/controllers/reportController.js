const Report = require('../models/Report');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a fake medicine report
// @route   POST /api/reports
// @access  Private
exports.submitReport = async (req, res, next) => {
  try {
    const {
      medicineName,
      brandName,
      batchNumber,
      manufacturingDate,
      expiryDate,
      suspicionType,
      description,
      purchaseLocation,
      medicineId,
      isAnonymous
    } = req.body;

    // Try to link to existing medicine
    let linkedMedicine = null;
    if (medicineId) {
      linkedMedicine = await Medicine.findOne({ 
        $or: [{ _id: medicineId }, { medicineId: medicineId }]
      });
    } else {
      // Try to auto-link by name
      linkedMedicine = await Medicine.findOne({
        name: { $regex: medicineName, $options: 'i' }
      });
    }

    // Build report
    const reportData = {
      reportedBy: req.user._id,
      medicineName,
      brandName,
      batchNumber,
      manufacturingDate,
      expiryDate,
      suspicionType,
      description,
      purchaseLocation,
      isAnonymous: isAnonymous || false
    };

    if (linkedMedicine) {
      reportData.medicine = linkedMedicine._id;
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      reportData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename
      }));
    }

    // Determine priority based on medicine risk level
    if (linkedMedicine) {
      if (linkedMedicine.riskLevel === 'critical') reportData.priority = 'urgent';
      else if (linkedMedicine.riskLevel === 'high') reportData.priority = 'high';
    }

    const report = await Report.create(reportData);

    // Update medicine report count if linked
    if (linkedMedicine) {
      const newReportCount = linkedMedicine.reportCount + 1;
      const updates = { 
        $inc: { reportCount: 1 },
        $set: {}
      };
      
      // Auto-flag if too many reports
      if (newReportCount >= 5) {
        updates.$set.isFlaggedAsFake = true;
        updates.$set.riskLevel = newReportCount >= 10 ? 'critical' : 'high';
      } else if (newReportCount >= 3) {
        updates.$set.riskLevel = 'medium';
      }
      
      await Medicine.findByIdAndUpdate(linkedMedicine._id, updates);
    }

    // Update user's report count
    await User.findByIdAndUpdate(req.user._id, { $inc: { reportsCount: 1 } });

    // Send confirmation email to reporter
    try {
      await sendEmail({
        email: req.user.email,
        subject: `Report Received - ${report.reportId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a6b3c;">✅ Your Report Has Been Received</h2>
            <p>Dear ${req.user.name},</p>
            <p>Thank you for reporting suspicious medicine. Your contribution helps protect millions of Indians.</p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Report ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${report.reportId}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Medicine</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${medicineName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd;">Under Review</td></tr>
            </table>
            <p>Our team will review your report and take appropriate action. You will be notified of updates.</p>
            <p>You can also contact CDSCO: <strong>1800-11-4430</strong></p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Report confirmation email failed:', emailErr.message);
    }

    // Alert admin for urgent reports
    if (reportData.priority === 'urgent') {
      try {
        await sendEmail({
          email: process.env.ADMIN_EMAIL,
          subject: `🚨 URGENT Report - ${report.reportId}`,
          html: `<p>Urgent fake medicine report submitted for ${medicineName}. Report ID: ${report.reportId}. Immediate review required.</p>`
        });
      } catch (e) {}
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      data: {
        reportId: report.reportId,
        status: report.status,
        priority: report.priority
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Private (admin)
exports.getAllReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, state, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (state) filter['purchaseLocation.state'] = state;
    if (search) {
      filter.$or = [
        { medicineName: { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('medicine', 'name brand')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's own reports
// @route   GET /api/reports/my
// @access  Private
exports.getMyReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Report.countDocuments({ reportedBy: req.user._id });
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate('medicine', 'name brand')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }]
    })
    .populate('reportedBy', 'name')
    .populate('medicine', 'name brand manufacturer category')
    .populate('reviewedBy', 'name');

    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    // Only admin or report owner can see full details
    if (req.user.role !== 'admin' && report.reportedBy._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this report', 403));
    }

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status (admin)
// @route   PUT /api/reports/:id/status
// @access  Private (admin)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes, referredToAuthority } = req.body;

    const report = await Report.findById(req.params.id).populate('reportedBy', 'name email');
    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    report.status = status || report.status;
    report.reviewNotes = reviewNotes || report.reviewNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = Date.now();
    if (referredToAuthority) {
      report.referredToAuthority = true;
      report.referralDate = Date.now();
    }

    await report.save();

    // Notify reporter
    try {
      const statusMessages = {
        verified: 'Your report has been verified. Action is being taken.',
        rejected: 'After review, we could not verify the report. Thank you for your vigilance.',
        action_taken: 'Action has been taken based on your report. Thank you for helping protect India.',
        under_review: 'Your report is currently under active review.'
      };

      if (statusMessages[status] && report.reportedBy.email) {
        await sendEmail({
          email: report.reportedBy.email,
          subject: `Report Update - ${report.reportId}`,
          html: `
            <p>Dear ${report.reportedBy.name},</p>
            <p><strong>Report ID:</strong> ${report.reportId}</p>
            <p>${statusMessages[status]}</p>
            ${reviewNotes ? `<p><strong>Note from reviewer:</strong> ${reviewNotes}</p>` : ''}
          `
        });
      }
    } catch (e) {}

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// @desc    Upvote a report
// @route   POST /api/reports/:id/upvote
// @access  Private
exports.upvoteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    // Check if already upvoted
    const alreadyUpvoted = report.upvotes.find(
      up => up.user.toString() === req.user._id.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote
      report.upvotes = report.upvotes.filter(
        up => up.user.toString() !== req.user._id.toString()
      );
      report.upvoteCount = Math.max(0, report.upvoteCount - 1);
    } else {
      // Add upvote
      report.upvotes.push({ user: req.user._id });
      report.upvoteCount += 1;
    }

    await report.save();

    res.status(200).json({
      success: true,
      upvoted: !alreadyUpvoted,
      upvoteCount: report.upvoteCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public reports feed
// @route   GET /api/reports/public
// @access  Public
exports.getPublicReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, state } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { status: { $in: ['pending', 'under_review', 'verified', 'action_taken'] } };
    if (state) filter['purchaseLocation.state'] = state;

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .select('reportId medicineName brandName suspicionType purchaseLocation status priority upvoteCount createdAt isAnonymous reportedBy')
      .populate('reportedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Mask reporter name if anonymous
    const sanitized = reports.map(r => {
      const obj = r.toObject();
      if (obj.isAnonymous) {
        obj.reportedBy = { name: 'Anonymous' };
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: sanitized.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: sanitized
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Public
exports.getReportStats = async (req, res, next) => {
  try {
    const [
      total,
      pending,
      verified,
      actionTaken,
      byState,
      byType,
      recent7Days
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'verified' }),
      Report.countDocuments({ status: 'action_taken' }),
      Report.aggregate([
        { $group: { _id: '$purchaseLocation.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Report.aggregate([
        { $group: { _id: '$suspicionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, verified, actionTaken, byState, byType, recent7Days }
    });
  } catch (err) {
    next(err);
  }
};
