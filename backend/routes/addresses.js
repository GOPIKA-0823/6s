const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/addresses
 * Get all addresses for the logged-in user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/addresses
 * Create a new address for the logged-in user
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, pincode, type, address, mobile, isDefault } = req.body;
    
    // Validate required fields
    if (!name || !pincode || !type || !address || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    } else {
      // If this is the user's first address, make it default automatically
      const addressCount = await Address.countDocuments({ userId: req.userId });
      if (addressCount === 0) {
        req.body.isDefault = true;
      }
    }

    const newAddress = new Address({
      userId: req.userId,
      name,
      pincode,
      type,
      address,
      mobile,
      isDefault: req.body.isDefault || isDefault
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/addresses/:id
 * Update an existing address
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    // Verify the address belongs to the user
    const existingAddress = await Address.findOne({ _id: addressId, userId: req.userId });
    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    // If setting to default, unset others
    if (req.body.isDefault && !existingAddress.isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAddress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/addresses/:id
 * Delete an address
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    // Verify the address belongs to the user
    const existingAddress = await Address.findOne({ _id: addressId, userId: req.userId });
    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    await Address.findByIdAndDelete(addressId);

    // If deleted was default, make the most recent one default (if any left)
    if (existingAddress.isDefault) {
      const remainingAddress = await Address.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/addresses/:id/default
 * Set an address as the default
 */
router.put('/:id/default', authMiddleware, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    // Verify the address belongs to the user
    const address = await Address.findOne({ _id: addressId, userId: req.userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    // Unset all other defaults
    await Address.updateMany({ userId: req.userId }, { isDefault: false });

    // Set this one as default
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
