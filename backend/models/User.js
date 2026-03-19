const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // User type: 'manufacturer' or 'retailer'
  userType: { type: String, required: true, enum: ['manufacturer', 'retailer'] },
  
  // Unique email for each user - prevents duplicate accounts
  // The 'unique: true' constraint creates the index automatically
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  // Password (in production, should be hashed with bcrypt)
  password: { type: String, required: true },
  
  // Company details
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  website: { type: String, trim: true },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);