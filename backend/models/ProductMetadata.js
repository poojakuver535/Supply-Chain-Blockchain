const mongoose = require('mongoose');

const ProductMetadataSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  category: {
    type: String,
    required: true
  },
  manufacturer: {
    name: String,
    location: String,
    contactInfo: String
  },
  extraAttributes: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  qrCode: String
});

module.exports = mongoose.model('ProductMetadata', ProductMetadataSchema);