import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, ACCESS_COOKIE_OPTIONS } from '../utils/helpers.js';

/**
 * Protect route — verifies access token from httpOnly cookie.
 * If access token expired, auto-refreshes using refresh token.
 */
export const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    let decoded;

    // Try verifying access token first
    if (accessToken) {
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (err) {
        // Access token expired — fall through to refresh
        if (err.name !== 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
      }
    }

    // If access token expired, try refresh token
    if (!decoded && refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Issue new access token
        const newAccessToken = generateAccessToken({
          id: refreshDecoded.id,
          role: refreshDecoded.role,
          email: refreshDecoded.email,
        });
        res.cookie('access_token', newAccessToken, ACCESS_COOKIE_OPTIONS);
        decoded = refreshDecoded;
      } catch {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
    }

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Authentication failed.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control — call after protect().
 * @param {...string} roles - Allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};
