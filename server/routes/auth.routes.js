import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);

export default router;
