const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');

// Initialize Razorpay
// Using default test keys if environment variables are not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SSYMrIBvjhGxuY',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'DdzNMN21Lq9tUFocEZFkEW6D',
});

/**
 * POST /api/payments/create-order
 * Create a new Razorpay order
 */
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ message: 'Some error occurred while creating Razorpay order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    
    let errorMessage = 'Something went wrong!';
    if (error && error.error && error.error.description) {
      errorMessage = `Razorpay Error: ${error.error.description}`;
    } else if (error && error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'DdzNMN21Lq9tUFocEZFkEW6D';
    
    // Creating hmac object 
    let hmac = crypto.createHmac('sha256', secret);
    
    // Passing the data to be hashed
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');
      
    if (razorpay_signature === generated_signature) {
        res.json({ message: "Payment verified successfully", success: true });
    } else {
        res.status(400).json({ message: "Payment verification failed", success: false });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: error.message || 'Verification failed!' });
  }
});

module.exports = router;
