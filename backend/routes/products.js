const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/products
 * Get all products created by the logged-in manufacturer
 * Query params: status (optional) - filter by status
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Ensure manufacturer can only see their own products
    const filter = { manufacturerId: req.userId };
    
    // Optional status filter (e.g., /products?status=active)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/products/admin/all
 * Get all products across all manufacturers (Admin only)
 */
router.get('/admin/all', async (req, res) => {
  try {
    const products = await Product.find().populate('manufacturerId', 'companyName email isVerified');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/products/marketplace
 * Get all active products from all manufacturers (for retailers to browse)
 * No authentication required - retailers can browse products
 */
router.get('/marketplace', async (req, res) => {
  try {
    // Show active products from all manufacturers
    const products = await Product.find({ status: 'active' })
      .populate('manufacturerId', 'companyName contactPerson email phone isVerified')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/products
 * Create a new product (only for manufacturers)
 * 
 * Required Headers:
 * - X-User-Id: The ID of the logged-in user (set by authMiddleware)
 * 
 * Body: { 
 *   name: 'Product Name',              // Required
 *   category: 'Beverages',             // Required
 *   description: 'Product details',    // Required
 *   price: 100,                        // Required, must be > 0
 *   stock: 50,                         // Required, must be >= 0
 *   minOrder: 10                       // Optional, defaults to 10
 * }
 * 
 * Returns: Created product object with manufacturerId and timestamps
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, price, stock, minOrder } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Product description is required.' });
    }
    if (price === undefined || price === null || price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0.' });
    }
    if (stock === undefined || stock === null || stock < 0) {
      return res.status(400).json({ message: 'Stock must be 0 or greater.' });
    }

    // Check if product with same name already exists for this manufacturer
    const existingProduct = await Product.findOne({
      manufacturerId: req.userId,
      name: name.trim()
    });

    if (existingProduct) {
      return res.status(400).json({ 
        message: `Product '${name}' already exists in your catalog. Please use a different name.` 
      });
    }

    // Create new product with manufacturerId from auth middleware
    const product = new Product({
      manufacturerId: req.userId,
      name: name.trim(),
      category,
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      minOrder: minOrder ? parseInt(minOrder) : 10,
      status: 'active'  // Products are active immediately (no approval needed)
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    // Handle duplicate name error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'You already have a product with this name. Please use a different name.' 
      });
    }
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/products/:id
 * Update a product (only if it belongs to the logged-in manufacturer)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Verify that the product belongs to the logged-in user
    const product = await Product.findOne({
      _id: req.params.id,
      manufacturerId: req.userId
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found or you do not have permission to edit it.' 
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (only if it belongs to the logged-in manufacturer)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verify that the product belongs to the logged-in user
    const product = await Product.findOne({
      _id: req.params.id,
      manufacturerId: req.userId
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found or you do not have permission to delete it.' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;