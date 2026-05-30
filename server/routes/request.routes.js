import express from 'express';
import {
  createRequest,
  getRequests,
  getNearbyRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  getRequestStats,
  createRequestValidation,
} from '../controllers/request.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorizeRoles('super_admin', 'hospital'), getRequestStats);
router.get('/nearby', authorizeRoles('donor'), getNearbyRequests);
router.get('/', authorizeRoles('super_admin', 'hospital', 'bloodbank_admin', 'recipient', 'donor'), getRequests);
router.post('/', authorizeRoles('recipient', 'hospital', 'super_admin'), createRequestValidation, validate, createRequest);
router.get('/:id', getRequestById);
router.put('/:id/status', authorizeRoles('hospital', 'super_admin', 'bloodbank_admin'), updateRequestStatus);
router.delete('/:id', cancelRequest);

export default router;
