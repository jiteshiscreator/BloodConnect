import express from 'express';
import {
  createBloodBank,
  getBloodBanks,
  getNearbyBloodBanks,
  getBloodBankById,
  getMyBloodBank,
  updateInventory,
  updateBloodBank,
  createBloodBankValidation,
} from '../controllers/bloodbank.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/nearby', getNearbyBloodBanks); // Public — for map view
router.get('/', getBloodBanks);             // Public — list all
router.get('/:id', getBloodBankById);        // Public — single bank

// Protected routes
router.use(protect);

router.get('/admin/my', authorizeRoles('bloodbank_admin'), getMyBloodBank);
router.post('/', authorizeRoles('super_admin', 'bloodbank_admin'), createBloodBankValidation, validate, createBloodBank);
router.put('/:id', authorizeRoles('super_admin', 'bloodbank_admin'), updateBloodBank);
router.put('/:id/inventory', authorizeRoles('super_admin', 'bloodbank_admin'), updateInventory);

export default router;
