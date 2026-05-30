import express from 'express';
import {
  getProfile,
  updateProfile,
  searchDonors,
  getEligibility,
  getAllUsers,
  updateUserStatus,
  getPlatformStats,
  searchDonorsValidation,
} from '../controllers/user.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/eligibility', authorizeRoles('donor'), getEligibility);
router.get('/donors/search', searchDonorsValidation, validate, searchDonors);
router.get('/stats', authorizeRoles('super_admin'), getPlatformStats);
router.get('/', authorizeRoles('super_admin', 'hospital'), getAllUsers);
router.put('/:id/status', authorizeRoles('super_admin'), updateUserStatus);

export default router;
