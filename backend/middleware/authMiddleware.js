/**
 * Authentication Middleware
 * 
 * This middleware verifies that the user is authenticated by checking
 * for a userId in the request headers or body.
 * 
 * In production, you should implement JWT tokens for better security.
 * Example: Bearer <token> in Authorization header
 */

const authMiddleware = (req, res, next) => {
  try {
    // Get userId from headers or body
    // Format: X-User-Id header or userId in body/query
    const userId = req.headers['x-user-id'] || req.body.userId || req.query.userId;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({ 
        message: 'Unauthorized: User ID is required. Please login first.' 
      });
    }

    // Attach userId to request object for use in routes
    req.userId = userId;

    // Continue to next middleware/route
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error: ' + error.message });
  }
};

module.exports = authMiddleware;
