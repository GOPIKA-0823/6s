const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/requests/admin/all
 * Get all product requests across the platform (Admin only)
 */
router.get('/admin/all', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('productId', 'name')
      .populate('manufacturerId', 'companyName isVerified')
      .populate('retailerId', 'companyName isVerified');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/requests/product-requests
 * Get all requests for products created by the logged-in manufacturer
 * (retailers requesting the manufacturer's products)
 */
router.get('/product-requests', authMiddleware, async (req, res) => {
  try {
    // Get requests where this user is the manufacturer
    const requests = await Request.find({ manufacturerId: req.userId })
      .populate('productId', 'name price stock')
      .populate('retailerId', 'companyName email phone address isVerified')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/requests/retailer-requests
 * Get all requests created by the logged-in retailer
 */
router.get('/retailer-requests', authMiddleware, async (req, res) => {
  try {
    // Get requests where this user is the retailer
    const requests = await Request.find({ retailerId: req.userId })
      .populate('productId', 'name price stock')
      .populate('manufacturerId', 'companyName email phone address isVerified')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/requests/:id
 * Get a specific request (only if user is manufacturer or retailer in the request)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      $or: [
        { manufacturerId: req.userId },
        { retailerId: req.userId }
      ]
    })
      .populate('productId', 'name price stock')
      .populate('manufacturerId', 'companyName email phone isVerified')
      .populate('retailerId', 'companyName email phone isVerified');

    if (!request) {
      return res.status(404).json({ 
        message: 'Request not found or you do not have permission to view it.' 
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/requests
 * Create a new request
 * Body: {
 *   productId, manufacturerId, quantity, unitPrice, totalAmount, 
 *   productName, manufacturerName, retailerName, notes (optional)
 * }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Ensure retailer is creating request for themselves
    if (req.body.retailerId && req.body.retailerId !== req.userId) {
      return res.status(403).json({ 
        message: 'You can only create requests for yourself.' 
      });
    }

    // Validate required fields
    const { isCustom, productId, manufacturerId, quantity, productName } = req.body;

    if (isCustom) {
      if (!productName || !manufacturerId || !quantity) {
        return res.status(400).json({ 
          message: 'productName, manufacturerId, and quantity are required for custom requests.' 
        });
      }
    } else {
      if (!productId || !manufacturerId || !quantity) {
        return res.status(400).json({ 
          message: 'productId, manufacturerId, and quantity are required.' 
        });
      }
    }

    const request = new Request({
      ...req.body,
      retailerId: req.userId, // Always use the ID from the auth middleware
      status: 'pending',
    });

    const newRequest = await request.save();
    res.status(201).json(newRequest);
  } catch (err) {
    // Check if it's a duplicate request error (e.g., pending request already exists)
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: 'You already have a pending request for this product. Please wait for response or cancel it.' 
      });
    }
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/requests/:id
 * Update request status
 * Manufacturers can: accept, reject
 * Retailers can: cancel
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Find the request
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check permissions
    if (request.manufacturerId.toString() === req.userId) {
      // Manufacturer - can accept or reject
      if (!['accepted', 'rejected', 'cancelled'].includes(req.body.status)) {
        return res.status(400).json({ 
          message: 'Manufacturer can only change status to accepted or rejected.' 
        });
      }
    } else if (request.retailerId.toString() === req.userId) {
      // Retailer - can only cancel
      if (req.body.status !== 'cancelled') {
        return res.status(400).json({ 
          message: 'Retailer can only cancel requests.' 
        });
      }
    } else {
      return res.status(403).json({ 
        message: 'You do not have permission to update this request.' 
      });
    }

    // Update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/requests/:id
 * Delete request (only if pending)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only retailer can delete, and only if pending
    if (request.retailerId.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Only the request creator can delete it.' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only delete pending requests.' 
      });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;