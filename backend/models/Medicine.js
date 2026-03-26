const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const medicineSchema = new mongoose.Schema({
  // Unique Medicine ID (used for QR code)
  medicineId: {
    type: String,
    unique: true,
    default: () => `MED-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 12)}`
  },
  // Basic Info
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Brand/manufacturer is required'],
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  // Drug Details
  category: {
    type: String,
    required: true,
    enum: [
      'Antibiotic', 'Antifungal', 'Antiviral', 'Analgesic', 'Antipyretic',
      'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid',
      'Cardiovascular', 'Respiratory', 'Neurological', 'Oncology',
      'Vitamin/Supplement', 'Vaccine', 'Contraceptive', 'Other'
    ]
  },
  composition: {
    type: String,
    required: true,
    trim: true
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Other'],
    required: true
  },
  strength: {
    type: String,
    trim: true
  },
  // Packaging Details
  packageSize: String,
  // Regulatory Info
  licenseNumber: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    default: 'CDSCO'
  },
  scheduleType: {
    type: String,
    enum: ['OTC', 'H', 'H1', 'X', 'G', 'C', 'Unknown'],
    default: 'Unknown'
  },
  // Identification features (for authentication)
  physicalFeatures: {
    color: String,
    shape: String,
    imprint: String,
    coating: String,
    specialMarking: String
  },
  packagingFeatures: {
    hologramPresent: { type: Boolean, default: false },
    barcodePresent: { type: Boolean, default: true },
    securitySealPresent: { type: Boolean, default: false },
    colorDescription: String,
    labelLanguages: [String]
  },
  // Reporting Statistics
  reportCount: {
    type: Number,
    default: 0
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  isFlaggedAsFake: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  // Added by
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Text search index
medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text', manufacturer: 'text' });
medicineSchema.index({ isFlaggedAsFake: 1 });
medicineSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
