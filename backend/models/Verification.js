const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  // Who verified
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // What was verified
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  searchQuery: {
    type: String,
    trim: true
  },
  // Result
  result: {
    type: String,
    enum: ['authentic', 'suspicious', 'not_found', 'flagged'],
    required: true
  },
  // Location
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // User feedback after verification
  userFeedback: {
    type: String,
    enum: ['confirmed_authentic', 'suspected_fake', 'unsure', null],
    default: null
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

verificationSchema.index({ medicine: 1 });
verificationSchema.index({ result: 1 });
verificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Verification', verificationSchema);
