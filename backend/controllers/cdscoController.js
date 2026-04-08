const Medicine = require('../models/Medicine');
const Report = require('../models/Report');
const { AppError } = require('../middleware/errorHandler');

// @desc    Lookup batch number in CDSCO database (Simulated)
// @route   GET /api/medicines/cdsco-lookup/:batchNumber
// @access  Public
exports.cdscoLookup = async (req, res, next) => {
  try {
    const { batchNumber } = req.params;

    if (!batchNumber) {
      return next(new AppError('Please provide a batch number', 400));
    }

  // Simulate an external API call to CDSCO
  // In a real app, this would be a fetch() to an official portal or a scraper
  
  // Logic: 
  // 1. Check if the batch is in our 'Reported Fakes' list
  // 2. Simulate random recall status for demonstration if batch ends in '99'
  
  const reportedCount = await Report.countDocuments({ batchNumber: batchNumber, status: 'verified' });
  
  let status = 'active';
  let message = 'Batch is currently active and not under recall.';
  let officialRecall = false;

  if (batchNumber.endsWith('99')) {
    status = 'recalled';
    message = 'OFFICIAL CDSCO ALERT: This batch has been recalled due to quality non-compliance (NSQ).';
    officialRecall = true;
  } else if (reportedCount > 5) {
    status = 'suspicious';
    message = 'High number of community reports for this batch. Exercise caution.';
  }

  res.status(200).json({
    success: true,
    data: {
      batchNumber,
      source: 'CDSCO Public Database (Simulated)',
      status: status,
      isRecalled: officialRecall,
      alertMessage: message,
      lastUpdated: new Date().toISOString()
    }
  });
} catch (err) {
  next(err);
}
};
