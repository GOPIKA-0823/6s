const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/orders/manufacturer
 * Get all orders for the logged-in manufacturer
 * Only manufacturers can view orders they've created
 */
router.get('/manufacturer', authMiddleware, async (req, res) => {
  try {
    // Return orders where this user is the manufacturer
    const orders = await Order.find({ manufacturerId: req.userId })
      .populate('retailerId', 'companyName email phone isVerified')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/orders/retailer
 * Get all orders for the logged-in retailer
 * Only retailers can view orders they've placed
 */
router.get('/retailer', authMiddleware, async (req, res) => {
  try {
    // Return orders where this user is the retailer
    const orders = await Order.find({ retailerId: req.userId })
      .populate('manufacturerId', 'companyName email phone isVerified')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/orders/:id
 * Get specific order (only if user is part of the order)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { manufacturerId: req.userId },
        { retailerId: req.userId }
      ]
    })
      .populate('manufacturerId', 'companyName email phone isVerified')
      .populate('retailerId', 'companyName email phone isVerified');

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or you do not have permission to view it.' 
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/orders
 * Create a new order
 * Body: { manufacturerId, retailerId, items[], totalAmount, manufacturerName, retailerName }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Ensure user is the retailer creating the order (for security)
    if (req.body.retailerId !== req.userId) {
      return res.status(403).json({ 
        message: 'You can only create orders for yourself.' 
      });
    }

    // Validate required fields
    if (!req.body.manufacturerId || !req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ 
        message: 'manufacturerId and items are required.' 
      });
    }

    const order = new Order({
      ...req.body,
      retailerId: req.userId,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/orders/:id
 * Update order status (manufacturers can update, retailers can't change their own orders)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only manufacturer or retailer of the order can update it
    if (order.manufacturerId.toString() !== req.userId && order.retailerId.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this order.' 
      });
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/orders/:id
 * Delete order (only if it's still in 'processing' status)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only retailer can delete, and only if processing
    if (order.retailerId.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Only retailer can delete orders.' 
      });
    }

    if (order.status !== 'processing') {
      return res.status(400).json({ 
        message: 'Can only delete orders in processing status.' 
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status with timeline tracking
 * Manufacturers can update order status
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { newStatus, notes } = req.body;

    // Validate status
    const validStatuses = ['order-placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ 
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only manufacturer can update status (except for cancellation by retailer)
    const isManufacturer = order.manufacturerId.toString() === req.userId;
    const isRetailer = order.retailerId.toString() === req.userId;

    if (!isManufacturer) {
      if (isRetailer && (newStatus === 'cancelled' || newStatus === 'returned')) {
        // Retailer can cancel if not shipped/delivered. Retailer can only return if delivered.
        if (newStatus === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) {
          return res.status(400).json({ 
            message: 'Order cannot be cancelled after it has been shipped.' 
          });
        }
        if (newStatus === 'returned' && order.status !== 'delivered') {
          return res.status(400).json({ 
            message: 'Order can only be returned after it has been delivered.' 
          });
        }
      } else {
        return res.status(403).json({ 
          message: 'Only manufacturer can update order status.' 
        });
      }
    }

    // Add to status timeline
    if (!order.statusTimeline) {
      order.statusTimeline = [];
    }

    order.statusTimeline.push({
      stage: newStatus,
      timestamp: new Date(),
      notes: notes || ''
    });

    order.status = newStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/orders/:id/tracking
 * Get order tracking details (timeline and current status)
 */
router.get('/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('manufacturerId', 'companyName email phone isVerified')
      .populate('retailerId', 'companyName email phone isVerified');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permission
    if (order.manufacturerId._id.toString() !== req.userId && order.retailerId._id.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this order.' 
      });
    }

    // Return tracking info
    res.json({
      orderId: order._id,
      currentStatus: order.status,
      statusTimeline: order.statusTimeline || [],
      items: order.items,
      totalAmount: order.totalAmount,
      manufacturerName: order.manufacturerName,
      retailerName: order.retailerName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/orders/analytics/manufacturer
 * Get analytics for the logged-in manufacturer
 */
router.get('/analytics/manufacturer', authMiddleware, async (req, res) => {
  try {
    const manufacturerId = req.userId;

    // Get all orders for this manufacturer
    const orders = await Order.find({ manufacturerId });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;

    // Get monthly sales data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = {};
    orders.forEach(order => {
      if (new Date(order.createdAt) >= sixMonthsAgo) {
        const month = new Date(order.createdAt).toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + order.totalAmount;
      }
    });

    // Get most sold products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Get unique retailers
    const uniqueRetailers = new Set(orders.map(o => o.retailerId.toString())).size;

    res.json({
      totalOrders,
      totalRevenue,
      deliveredOrders,
      processingOrders,
      uniqueRetailers,
      monthlyData,
      topProducts,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/orders/analytics/admin
 * Get platform-wide analytics (admin only)
 */
router.get('/analytics/admin', authMiddleware, async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    // Get monthly sales data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = {};
    orders.forEach(order => {
      if (new Date(order.createdAt) >= sixMonthsAgo) {
        const month = new Date(order.createdAt).toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + order.totalAmount;
      }
    });

    // Get top manufacturers
    const manufacturerSales = {};
    orders.forEach(order => {
      if (!manufacturerSales[order.manufacturerName]) {
        manufacturerSales[order.manufacturerName] = { revenue: 0, orders: 0 };
      }
      manufacturerSales[order.manufacturerName].revenue += order.totalAmount;
      manufacturerSales[order.manufacturerName].orders += 1;
    });

    const topManufacturers = Object.entries(manufacturerSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      totalOrders,
      totalRevenue,
      deliveredOrders,
      processingOrders,
      cancelledOrders,
      monthlyData,
      topManufacturers,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;