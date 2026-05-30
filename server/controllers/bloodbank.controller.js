import { body } from 'express-validator';
import BloodBank from '../models/BloodBank.js';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { buildNearQuery } from '../utils/geoQuery.js';
import { getIO } from '../config/socket.js';
import { BLOOD_TYPES } from '../utils/helpers.js';

// ── Validation ────────────────────────────────────────────
export const createBloodBankValidation = [
  body('name').trim().notEmpty().withMessage('Blood bank name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
];

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/bloodbanks — create a new blood bank (admin only)
 */
export const createBloodBank = async (req, res, next) => {
  try {
    const { name, licenseNumber, address, phone, email, lat, lng, operatingHours } = req.body;

    const bank = await BloodBank.create({
      name,
      licenseNumber,
      address,
      phone,
      email,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      operatingHours,
      admin: req.user._id,
    });

    // Link bank to admin user
    await User.findByIdAndUpdate(req.user._id, { bloodBankRef: bank._id });

    res.status(201).json({ success: true, message: 'Blood bank created', data: bank });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bloodbanks — list all blood banks
 */
export const getBloodBanks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [banks, total] = await Promise.all([
      BloodBank.find({ isActive: true }).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      BloodBank.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      data: banks,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bloodbanks/nearby?lat=17.385&lng=78.4867&bloodType=A+&radius=10000
 */
export const getNearbyBloodBanks = async (req, res, next) => {
  try {
    const { lat, lng, bloodType, radius = 10000 } = req.query;

    const filter = {
      isActive: true,
      location: buildNearQuery(lat, lng, Number(radius)),
    };

    if (bloodType) {
      filter[`inventory.${bloodType}.units`] = { $gt: 0 };
    }

    const banks = await BloodBank.find(filter).limit(15);

    res.json({ success: true, count: banks.length, data: banks });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bloodbanks/:id
 */
export const getBloodBankById = async (req, res, next) => {
  try {
    const bank = await BloodBank.findById(req.params.id).populate('admin', 'name email phone');
    if (!bank) throw new AppError('Blood bank not found', 404);
    res.json({ success: true, data: bank });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bloodbanks/my — blood bank admin's own bank
 */
export const getMyBloodBank = async (req, res, next) => {
  try {
    const bank = await BloodBank.findOne({ admin: req.user._id });
    if (!bank) throw new AppError('No blood bank linked to your account', 404);
    res.json({ success: true, data: bank });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bloodbanks/:id/inventory — update blood type stock
 */
export const updateInventory = async (req, res, next) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) throw new AppError('Blood bank not found', 404);

    // Only the bank's own admin or super_admin can update
    if (
      bank.admin?.toString() !== req.user._id.toString() &&
      req.user.role !== 'super_admin'
    ) {
      throw new AppError('Not authorized to update this inventory', 403);
    }

    const { updates } = req.body;
    // updates: [{ bloodType: 'A+', units: 5, expiryDate: '2024-12-31' }]
    if (!Array.isArray(updates)) throw new AppError('updates must be an array', 400);

    updates.forEach(({ bloodType, units, expiryDate }) => {
      if (!BLOOD_TYPES.includes(bloodType)) return;
      bank.inventory[bloodType] = {
        units: Math.max(0, Number(units)),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        lastUpdated: new Date(),
      };
    });

    await bank.save();

    // Broadcast inventory update to all connected clients
    getIO().emit('inventoryUpdate', {
      bankId: bank._id,
      bankName: bank.name,
      inventory: bank.inventory,
    });

    res.json({ success: true, message: 'Inventory updated', data: bank });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bloodbanks/:id — update blood bank info (owner or super_admin only)
 */
export const updateBloodBank = async (req, res, next) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) throw new AppError('Blood bank not found', 404);

    // Ownership check — only the bank's own admin or a super_admin may edit
    if (
      bank.admin?.toString() !== req.user._id.toString() &&
      req.user.role !== 'super_admin'
    ) {
      throw new AppError('Not authorized to update this blood bank', 403);
    }

    // Prevent overwriting the admin field via body
    delete req.body.admin;

    const updated = await BloodBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Blood bank updated', data: updated });
  } catch (error) {
    next(error);
  }
};
