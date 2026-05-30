import express from 'express';
import {
  logDonation,
  getMyDonations,
  getAllDonations,
  logDonationValidation,
} from '../controllers/donation.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('donor'), logDonationValidation, validate, logDonation);
router.get('/my', authorizeRoles('donor'), getMyDonations);
router.get('/', authorizeRoles('super_admin', 'bloodbank_admin', 'hospital'), getAllDonations);

export default router;
