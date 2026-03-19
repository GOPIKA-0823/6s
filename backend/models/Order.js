const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Reference to manufacturer (User ID)
  // Ensures order belongs to specific manufacturer - data isolation
  manufacturerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  // Reference to retailer (User ID)
  // Ensures order belongs to specific retailer
  retailerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  // Store names for display (denormalized for convenience)
  manufacturerName: { type: String, required: true, trim: true },
  retailerName: { type: String, required: true, trim: true },
  
  // Order items with product references
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }
  ],
  
  // Order totals and status
  totalAmount: { type: Number, required: true, min: 0 },
  
  // Enhanced status tracking with detailed stages
  status: { 
    type: String, 
    default: 'order-placed', 
    enum: ['order-placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] 
  },
  
  // Status timeline tracking - when each stage was reached
  statusTimeline: [
    {
      stage: { 
        type: String, 
        enum: ['order-placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] 
      },
      timestamp: { type: Date, default: Date.now },
      notes: { type: String, trim: true }
    }
  ],
  
  // Order dates
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  
  // Additional order details
  shippingAddress: { type: String, trim: true },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'online', 'card', 'upi', 'cod'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String, trim: true },
  razorpayPaymentId: { type: String, trim: true },
  notes: { type: String, trim: true },
  
}, { timestamps: true });

// Indexes for faster queries when filtering by manufacturer or retailer
orderSchema.index({ manufacturerId: 1 });
orderSchema.index({ retailerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);