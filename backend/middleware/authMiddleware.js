const UserModel = require('../models/userModel');

// Extract user from request headers, query, or body
function authenticate(req, res, next) {
  let userId = null;

  // 1. Check 'x-user-id' header
  if (req.headers['x-user-id']) {
    userId = req.headers['x-user-id'].trim();
  }

  // 2. Check Authorization header: "Bearer USR-01" or "Bearer token_USR-01"
  if (!userId && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const token = parts[1].trim();
      userId = token.startsWith('token_') ? token.replace('token_', '') : token;
    }
  }

  // 3. Check query parameter fallback
  if (!userId && req.query && req.query.userId) {
    userId = req.query.userId.trim();
  }

  // 4. Check body parameter fallback
  if (!userId && req.body && req.body.userId) {
    userId = req.body.userId.trim();
  }

  if (userId) {
    const user = UserModel.getById(userId);
    if (user) {
      const { password, ...safeUser } = user;
      req.user = safeUser;
    } else {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

// Require authenticated user
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid user session (x-user-id or Authorization header).'
    });
  }
  next();
}

// Require at least one of the specified roles (or Admin)
function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: `Authentication required: Action requires one of [${allowedRoles.join(', ')}] role(s). Please log in.`
      });
    }

    const userRoles = req.user.roles || [];

    // Admins always have full platform privileges
    if (userRoles.includes('Admin')) {
      return next();
    }

    // Check if user has any of the required roles
    const hasRole = userRoles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Action requires one of [${allowedRoles.join(', ')}] role(s). Your account currently holds [${userRoles.join(', ')}].`
      });
    }

    // For NGO specific operations, check verification
    if (allowedRoles.includes('NGO') && !userRoles.includes('Admin')) {
      if (req.user.status === 'Pending Verification') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Your NGO account is pending administrative verification before claims can be made.'
        });
      }
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireAuth,
  requireRoles
};
