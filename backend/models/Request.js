const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Reference to product being requested
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: false, // Optional for custom requests
  },

  isCustom: {
    type: Boolean,
    default: false
  },
  
  // Reference to manufacturer and retailer (User IDs)
  // Ensures request is linked to specific users
  manufacturerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  retailerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  // Product and company names (denormalized for display)
  productName: { type: String, required: true, trim: true },
  manufacturerName: { type: String, required: true, trim: true },
  retailerName: { type: String, required: true, trim: true },
  
  // Request details
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'] 
  },
  notes: { type: String, trim: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

// Indexes for faster queries by manufacturerId and retailerId
requestSchema.index({ manufacturerId: 1 });
requestSchema.index({ retailerId: 1 });
requestSchema.index({ productId: 1 });

// Prevent duplicate pending requests:
// Same retailer cannot have multiple pending requests for the same product
// Unique index on (retailerId, productId) where status is 'pending'
requestSchema.index(
  { 
    retailerId: 1, 
    productId: 1, 
    status: 1 
  }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      status: 'pending',
      isCustom: false // Only apply uniqueness to standard marketplace requests
    } 
  }
);

module.exports = mongoose.model('Request', requestSchema);