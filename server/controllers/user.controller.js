import { body, query } from 'express-validator';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { buildNearQuery, buildGeoPoint } from '../utils/geoQuery.js';
import { isDonorEligible, daysUntilEligible } from '../utils/helpers.js';

// ── Validation ────────────────────────────────────────────
export const searchDonorsValidation = [
  query('bloodType').notEmpty().withMessage('Blood type is required'),
  query('lat').isFloat().withMessage('Valid latitude required'),
  query('lng').isFloat().withMessage('Valid longitude required'),
];

// ── Controllers ───────────────────────────────────────────

/**
 * GET /api/users/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bloodBankRef', 'name address location');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bloodType, city, lat, lng, hospitalName } = req.body;

    const updates = { name, phone, city };
    if (bloodType) updates.bloodType = bloodType;
    if (hospitalName) updates.hospitalName = hospitalName;
    if (lat && lng) {
      updates.location = buildGeoPoint(lat, lng);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/donors/search?bloodType=A+&lat=17.385&lng=78.4867&radius=10000
 * Find eligible donors within a radius matching blood type.
 */
export const searchDonors = async (req, res, next) => {
  try {
    const { bloodType, lat, lng, radius = 10000 } = req.query;

    const donors = await User.find({
      role: 'donor',
      bloodType,
      isEligible: true,
      isActive: true,
      location: buildNearQuery(lat, lng, Number(radius)),
    }).select('name bloodType city location phone donationCount lastDonated');

    res.json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/eligibility — donor's own eligibility status
 */
export const getEligibility = async (req, res, next) => {
  try {
    if (req.user.role !== 'donor') {
      throw new AppError('Only donors have eligibility status', 400);
    }

    const eligible = isDonorEligible(req.user.lastDonated);
    const daysLeft = daysUntilEligible(req.user.lastDonated);

    res.json({
      success: true,
      data: {
        isEligible: eligible,
        daysUntilEligible: daysLeft,
        lastDonated: req.user.lastDonated,
        donationCount: req.user.donationCount,
        nextEligibleDate: req.user.lastDonated
          ? new Date(new Date(req.user.lastDonated).getTime() + 56 * 24 * 60 * 60 * 1000)
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users — admin: get all users with filters
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, bloodType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (bloodType) filter.bloodType = bloodType;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/status — admin: activate/deactivate user
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats — admin: dashboard stats
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, donors, activeDonors, recipients, hospitals] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'donor', isActive: true }),
      User.countDocuments({ role: 'donor', isEligible: true, isActive: true }),
      User.countDocuments({ role: 'recipient', isActive: true }),
      User.countDocuments({ role: 'hospital', isActive: true }),
    ]);

    res.json({
      success: true,
      data: { totalUsers, donors, activeDonors, recipients, hospitals },
    });
  } catch (error) {
    next(error);
  }
};
