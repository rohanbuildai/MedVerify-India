const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    default: function() {
      return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  // Reporter
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Medicine (may be linked to existing or described manually)
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  // Manual entry if medicine not in DB
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  manufacturingDate: Date,
  expiryDate: Date,
  // Suspicion details
  suspicionType: {
    type: String,
    required: true,
    enum: [
      'wrong_color',
      'wrong_shape',
      'wrong_texture',
      'unusual_smell',
      'packaging_quality',
      'missing_hologram',
      'price_too_low',
      'no_effect',
      'adverse_reaction',
      'wrong_imprint',
      'seal_tampered',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Please provide at least 20 characters of description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Location of purchase
  purchaseLocation: {
    shopName: String,
    address: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Evidence
  images: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'action_taken'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Admin review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date,
  // CDSCO / Authority referral
  referredToAuthority: {
    type: Boolean,
    default: false
  },
  referralDate: Date,
  referralReference: String,
  // Upvotes (others confirming same issue)
  upvotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotedAt: { type: Date, default: Date.now }
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  // Anonymous flag
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1 });
reportSchema.index({ 'purchaseLocation.state': 1 });
reportSchema.index({ 'purchaseLocation.city': 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ medicine: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
