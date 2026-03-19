const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/users/manufacturers/list
 * Get list of all active manufacturers
 */
router.get('/manufacturers/list', async (req, res) => {
  try {
    const manufacturers = await User.find({ 
      userType: 'manufacturer',
      isActive: true 
    }).select('companyName contactPerson email phone address');
    res.json(manufacturers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/users/register
 * Register a new user (manufacturer or retailer)
 * 
 * Body: {
 *   userType: 'manufacturer' | 'retailer',
 *   email: 'user@example.com',
 *   password: 'password123',
 *   name: 'Contact Person Name',         // Required: contact person's name
 *   companyName: 'Company Name',          // Required: company/shop name
 *   phone: '1234567890',
 *   address: 'Company Address'
 * }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, userType, name, companyName, password, phone, address } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!userType) {
      return res.status(400).json({ message: 'userType is required (manufacturer or retailer).' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Contact person name is required.' });
    }
    if (!companyName) {
      return res.status(400).json({ message: 'Company/Shop name is required.' });
    }

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered. Please use a different email or login.' 
      });
    }

    // Validate userType
    if (!['manufacturer', 'retailer'].includes(userType)) {
      return res.status(400).json({ 
        message: "userType must be 'manufacturer' or 'retailer'" 
      });
    }

    // Create new user with all provided fields
    const user = new User({
      userType,
      email: email.toLowerCase(),
      password, // In production, hash with bcrypt
      contactPerson: name,  // Store contact person name
      companyName,
      phone: phone || '',
      address: address || '',
    });

    const newUser = await user.save();

    // Remove password before sending response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Registration error:', err);
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: 'Email already registered. Please use a different email.' 
      });
    }
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/users/login
 * Authenticate user with email and password
 * 
 * Body: {
 *   email: 'user@example.com',
 *   password: 'password123'
 * }
 * 
 * Returns: User object with ID (used for subsequent requests)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password.' 
      });
    }

    // Check password (in production, use bcrypt to hash passwords)
    if (user.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid email or password.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    // Remove password before sending response
    delete user.password;

    res.json({
      message: 'Login successful',
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile (only their own profile)
 */
router.put('/:id', async (req, res) => {
  try {
    // Prevent updating email or userType
    const { email, userType, password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/users/:id/toggle-status
 * Toggle user active status (Admin only)
 */
router.get('/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/users/:id/verify
 * Toggle user verification status (Admin only)
 */
router.get('/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isVerified = !user.isVerified;
    await user.save();
    
    res.json({ 
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;