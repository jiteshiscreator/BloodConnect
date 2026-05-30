import { body } from 'express-validator';
import User from '../models/User.js';
import { sendTokenCookies, clearTokenCookies, isDonorEligible } from '../utils/helpers.js';
import { buildGeoPoint } from '../utils/geoQuery.js';
import { AppError } from '../middleware/error.middleware.js';

// ── Validation rules ──────────────────────────────────────
export const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['donor', 'recipient', 'hospital', 'bloodbank_admin'])
    .withMessage('Invalid role selected'),
  body('phone').optional({checkFalsy:true}).isMobilePhone().withMessage('Invalid phone number'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bloodType, city, lat, lng, hospitalName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const location = lat && lng ? { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } : undefined;

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      bloodType: ['donor', 'recipient'].includes(role) ? bloodType : undefined,
      city: city || 'Hyderabad',
      location,
      hospitalName: role === 'hospital' ? hospitalName : undefined,
      isEligible: role === 'donor' ? isDonorEligible(null) : undefined,
    });

    sendTokenCookies(res, user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated. Contact support.', 403);
    }

    sendTokenCookies(res, user);

    const safeUser = user.toSafeJSON();

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  clearTokenCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * GET /api/auth/me — return current user from token
 */
export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh — manually refresh access token
 */
export const refreshToken = async (req, res, next) => {
  // The protect middleware already handles refresh automatically.
  // This endpoint is for explicit client-side refresh calls.
  try {
    res.json({ success: true, message: 'Token refreshed', data: req.user });
  } catch (error) {
    next(error);
  }
};
