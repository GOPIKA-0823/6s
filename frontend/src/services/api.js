import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Interceptor to add userId to all requests
 * Gets userId from localStorage (set during login)
 */
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('agaram_user'));
    if (user && user._id) {
      // Add userId as header for authentication
      config.headers['X-User-Id'] = user._id;
    } else if (!config.url.includes('/register') && !config.url.includes('/login')) {
      // Only log warning for authenticated endpoints
      console.warn('No user ID found in localStorage. User may not be logged in.');
    }
  } catch (error) {
    console.error('Error adding userId to request:', error);
  }
  return config;
});

// ============ USER AUTHENTICATION ============

/**
 * Register a new user (manufacturer or retailer)
 */
export const registerUser = (userData) => 
  api.post('/users/register', userData);

/**
 * ALIAS: createUser is an alias for registerUser
 * Used for backward compatibility with existing code
 */
export const createUser = (userData) => 
  api.post('/users/register', userData);

/**
 * Login user with email and password
 */
export const loginUser = (credentials) => 
  api.post('/users/login', credentials);

/**
 * Get user profile by ID
 */
export const getUserProfile = (userId) => 
  api.get(`/users/${userId}`);

/**
 * Update user profile
 */
export const updateUserProfile = (userId, userData) => 
  api.put(`/users/${userId}`, userData);

/**
 * Get all users registered on the platform
 * (Admin use only)
 */
export const getAllUsers = () => 
  api.get('/users');

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = (userId) => 
  api.get(`/users/${userId}/toggle-status`);

/**
 * Toggle user verification status (Admin only)
 */
export const toggleUserVerification = (userId) => 
  api.get(`/users/${userId}/verify`);

/**
 * Get all active manufacturers
 * Used by retailers to target specific manufacturers for custom requests
 */
export const getAllManufacturers = () =>
  api.get('/users/manufacturers/list');

// ============ PRODUCTS ============

/**
 * Get all products created by the logged-in manufacturer
 * Only accessible to manufacturers
 */
export const getManufacturerProducts = (status = null) => {
  let url = '/products';
  if (status) {
    url += `?status=${status}`;
  }
  return api.get(url);
};

/**
 * Get all active products from all manufacturers (marketplace)
 * Accessible to retailers for browsing
 */
export const getMarketplaceProducts = () => 
  api.get('/products/marketplace');

/**
 * Create a new product (manufacturers only)
 */
export const createProduct = (productData) => 
  api.post('/products', productData);

/**
 * Update a product
 */
export const updateProduct = (productId, productData) => 
  api.put(`/products/${productId}`, productData);

/**
 * Get all products across the platform (Admin only)
 */
export const getAllProductsAdmin = () => 
  api.get('/products/admin/all');

/**
 * Delete a product
 */
export const deleteProduct = (productId) => 
  api.delete(`/products/${productId}`);

// ============ REQUESTS ============

/**
 * Get all requests for products created by the logged-in manufacturer
 * (requests from retailers)
 */
export const getProductRequests = () => 
  api.get('/requests/product-requests');

/**
 * Get all requests created by the logged-in retailer
 */
export const getRetailerRequests = () => 
  api.get('/requests/retailer-requests');

/**
 * Get a specific request
 */
export const getRequest = (requestId) => 
  api.get(`/requests/${requestId}`);

/**
 * Create a new request (retailers only)
 */
export const createRequest = (requestData) => 
  api.post('/requests', requestData);

/**
 * Update request status
 */
export const updateRequest = (requestId, statusData) => 
  api.put(`/requests/${requestId}`, statusData);

/**
 * Get all requests across the platform (Admin only)
 */
export const getAllRequestsAdmin = () => 
  api.get('/requests/admin/all');

/**
 * Delete a request
 */
export const deleteRequest = (requestId) => 
  api.delete(`/requests/${requestId}`);

// ============ ORDERS ============

/**
 * Get all orders for the logged-in manufacturer
 */
export const getManufacturerOrders = () => 
  api.get('/orders/manufacturer');

/**
 * Get all orders for the logged-in retailer
 */
export const getRetailerOrders = () => 
  api.get('/orders/retailer');

/**
 * Update order status with timeline tracking
 * Body: { newStatus, notes }
 */
export const updateOrderStatus = (orderId, statusData) => 
  api.put(`/orders/${orderId}/status`, statusData);

/**
 * Get detailed order tracking information with timeline
 */
export const getOrderTracking = (orderId) => 
  api.get(`/orders/${orderId}/tracking`);

// ============ ANALYTICS ============

/**
 * Get analytics data for logged-in manufacturer
 */
export const getManufacturerAnalytics = () => 
  api.get('/orders/analytics/manufacturer');

/**
 * Get platform-wide analytics (admin only)
 */
export const getAdminAnalytics = () => 
  api.get('/orders/analytics/admin');

/**
 * Get a specific order
 */
export const getOrder = (orderId) => 
  api.get(`/orders/${orderId}`);

/**
 * Create a new order
 */
export const createOrder = (orderData) => 
  api.post('/orders', orderData);

/**
 * Update order status
 */
export const updateOrder = (orderId, orderData) => 
  api.put(`/orders/${orderId}`, orderData);

/**
 * Delete an order
 */
export const deleteOrder = (orderId) => 
  api.delete(`/orders/${orderId}`);

// ============ PAYMENTS (RAZORPAY) ============

/**
 * Create a new Razorpay payment order
 * @param {Object} paymentData - Should contain { amount }
 */
export const createRazorpayOrder = (paymentData) => 
  api.post('/payments/create-order', paymentData);

/**
 * Verify Razorpay payment signature after successful completion
 * @param {Object} verificationData - Should contain { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyRazorpayPayment = (verificationData) => 
  api.post('/payments/verify', verificationData);

// ============ CONTACT MESSAGES ============

/**
 * Submit a new contact message
 */
export const submitContactMessage = (messageData) => 
  api.post('/contact-messages', messageData);

/**
 * Get all contact messages (Admin only)
 */
export const getContactMessages = () => 
  api.get('/contact-messages');

/**
 * Mark a message as read
 */
export const markMessageAsRead = (messageId) => 
  api.put(`/contact-messages/${messageId}`);

/**
 * Delete a contact message
 */
export const deleteContactMessage = (messageId) => 
  api.delete(`/contact-messages/${messageId}`);

// ============ ADDRESSES ============

/**
 * Get all saved addresses for the logged-in user
 */
export const getAddresses = () => api.get('/addresses');

/**
 * Add a new saved address
 */
export const addAddress = (addressData) => api.post('/addresses', addressData);

/**
 * Update a saved address
 */
export const updateAddress = (addressId, addressData) => api.put(`/addresses/${addressId}`, addressData);

/**
 * Set an address as default
 */
export const setDefaultAddress = (addressId) => api.put(`/addresses/${addressId}/default`);

/**
 * Delete a saved address
 */
export const deleteAddress = (addressId) => api.delete(`/addresses/${addressId}`);