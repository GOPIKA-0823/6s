const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Reference to the manufacturer (User ID who created this product)
  // This links product to its owner, ensuring data isolation
  manufacturerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  // Product details
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  // Pricing and stock info
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 10, min: 1 },
  
  // Product status
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'discontinued'] },
}, { timestamps: true });

// Prevent duplicate products: same manufacturer cannot create products with duplicate names
// Unique index on (manufacturerId, name) pair
productSchema.index({ manufacturerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);