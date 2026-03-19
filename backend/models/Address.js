const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  pincode: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['HOME', 'OFFICE', 'OTHER'],
    default: 'HOME'
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  mobile: { 
    type: String, 
    required: true, 
    trim: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
