/**
 * Dynamic Data Functions using Real APIs
 * 
 * These functions fetch data from MongoDB via the backend APIs
 * instead of returning hardcoded values.
 * 
 * They calculate stats based on real data from the database.
 */

import * as api from './api';

/**
 * Get manufacturer dashboard stats
 * Calculates real statistics from database
 */
export const getManufacturerStats = async () => {
  try {
    // Fetch products, requests, and orders for the manufacturer
    const [productsRes, requestsRes, ordersRes] = await Promise.all([
      api.getManufacturerProducts(),
      api.getProductRequests(),
      api.getManufacturerOrders(),
    ]);

    const products = productsRes.data;
    const requests = requestsRes.data;
    const orders = ordersRes.data;

    // Calculate totals
    const totalProducts = products.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const activeOrders = orders.filter(o => ['processing', 'shipped'].includes(o.status)).length;
    
    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Get recent requests (last 3)
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(req => ({
        id: req._id,
        productName: req.productName,
        retailerName: req.retailerName,
        quantity: req.quantity,
        status: req.status,
      }));

    // Get recent orders (last 3)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(order => ({
        id: order._id,
        status: order.status,
        amount: order.totalAmount,
      }));

    return {
      totalProducts,
      pendingRequests,
      activeOrders,
      totalRevenue,
      recentRequests,
      recentOrders,
    };
  } catch (error) {
    console.error('Error fetching manufacturer stats:', error);
    // Return default values if API fails
    return {
      totalProducts: 0,
      pendingRequests: 0,
      activeOrders: 0,
      totalRevenue: 0,
      recentRequests: [],
      recentOrders: [],
    };
  }
};

/**
 * Get retailer dashboard stats
 * Calculates real statistics from database
 */
export const getRetailerStats = async () => {
  try {
    // Fetch requests and orders for the retailer
    const [requestsRes, ordersRes] = await Promise.all([
      api.getRetailerRequests(),
      api.getRetailerOrders(),
    ]);

    const requests = requestsRes.data;
    const orders = ordersRes.data;

    // Calculate totals
    const activeRequests = requests.filter(r => r.status === 'pending').length;
    const activeOrders = orders.filter(o => ['processing', 'shipped'].includes(o.status)).length;
    
    // Calculate total spent
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculate pending bills (unpaid orders)
    const pendingBills = orders.filter(o => o.status === 'processing').length;

    // Get recent requests (last 3)
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(req => ({
        id: req._id,
        productName: req.productName,
        manufacturerName: req.manufacturerName,
        status: req.status,
        quantity: req.quantity,
      }));

    // Get recent orders (last 3)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(order => ({
        id: order._id,
        status: order.status,
        manufacturerName: order.manufacturerName,
        amount: order.totalAmount,
      }));

    return {
      activeRequests,
      activeOrders,
      totalSpent,
      pendingBills,
      recentRequests,
      recentOrders,
    };
  } catch (error) {
    console.error('Error fetching retailer stats:', error);
    // Return default values if API fails
    return {
      activeRequests: 0,
      activeOrders: 0,
      totalSpent: 0,
      pendingBills: 0,
      recentRequests: [],
      recentOrders: [],
    };
  }
};

/**
 * Get marketplace products (for retailers to browse)
 * Fetches all active products from all manufacturers
 */
export const getMarketplaceProducts = async () => {
  try {
    const response = await api.getMarketplaceProducts();
    return response.data;
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    return [];
  }
};

/**
 * Get manufacturer's products
 */
export const getManufacturerProducts = async () => {
  try {
    const response = await api.getManufacturerProducts();
    return response.data;
  } catch (error) {
    console.error('Error fetching manufacturer products:', error);
    return [];
  }
};

/**
 * Get product requests (for manufacturers)
 */
export const getProductRequests = async () => {
  try {
    const response = await api.getProductRequests();
    return response.data;
  } catch (error) {
    console.error('Error fetching product requests:', error);
    return [];
  }
};

/**
 * Get retailer's requests
 */
export const getRetailerRequests = async () => {
  try {
    const response = await api.getRetailerRequests();
    return response.data;
  } catch (error) {
    console.error('Error fetching retailer requests:', error);
    return [];
  }
};

/**
 * Get manufacturer's orders
 */
export const getManufacturerOrders = async () => {
  try {
    const response = await api.getManufacturerOrders();
    return response.data;
  } catch (error) {
    console.error('Error fetching manufacturer orders:', error);
    return [];
  }
};

/**
 * Get retailer's orders
 */
export const getRetailerOrders = async () => {
  try {
    const response = await api.getRetailerOrders();
    return response.data;
  } catch (error) {
    console.error('Error fetching retailer orders:', error);
    return [];
  }
};

/**
 * Get retailer bills/invoices
 * Bills are generated from completed orders and sent to retailers for payment
 * In a real implementation, this would come from a Bills collection or be calculated from Orders
 */
export const getRetailerBills = async () => {
  try {
    // Get retailer orders
    const response = await api.getRetailerOrders();
    const orders = response.data || [];

    // Generate bills from delivered/shipped orders
    const bills = orders
      .filter(order => ['shipped', 'delivered'].includes(order.status))
      .map((order, index) => ({
        id: index + 1,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        orderId: order._id,
        manufacturerName: order.manufacturerName,
        date: new Date(order.createdAt).toISOString().split('T')[0],
        amount: order.totalAmount,
        status: order.status === 'delivered' ? 'paid' : 'pending',
      }));

    return bills;
  } catch (error) {
    console.error('Error fetching retailer bills:', error);
    return [];
  }
};