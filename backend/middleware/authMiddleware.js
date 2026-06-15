import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer scheme
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify JWT access token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Bind matching user to request object (excluding password hash)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user account not found'));
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      return next(new Error('Not authorized, token signature failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

// Check if user has required role(s)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

export { protect, authorizeRoles };
