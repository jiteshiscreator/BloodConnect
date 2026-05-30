import { body } from 'express-validator';
import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/error.middleware.js';
import { isDonorEligible } from '../utils/helpers.js';
import { getIO } from '../config/socket.js';

// ── Validation ────────────────────────────────────────────
export const logDonationValidation = [
  body('bloodType').isIn(['A+','A-','B+','B-','O+','O-','AB+','AB-']).withMessage('Valid blood type required'),
  body('units').isInt({ min: 1, max: 2 }).withMessage('Units must be 1 or 2'),
];

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/donations — log a completed donation.
 *
 * Wrapped in a MongoDB transaction so that a mid-execution crash
 * cannot leave orphaned Donation records or corrupt User/BloodRequest state.
 */
export const logDonation = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bloodType, units, bloodBank, bloodRequest, vitalSigns, notes, donatedAt } = req.body;

    const donor = await User.findById(req.user._id).session(session);
    if (!isDonorEligible(donor.lastDonated)) {
      throw new AppError('Donor is not yet eligible to donate (56-day cooldown)', 400);
    }

    // 1. Create donation record
    const [donation] = await Donation.create(
      [
        {
          donor: req.user._id,
          bloodType: bloodType || donor.bloodType,
          units,
          bloodBank,
          bloodRequest,
          vitalSigns,
          notes,
          donatedAt: donatedAt ? new Date(donatedAt) : undefined,
          status: 'completed',
        },
      ],
      { session }
    );

    // 2. Update donor eligibility atomically
    await User.findByIdAndUpdate(
      req.user._id,
      {
        lastDonated: donation.donatedAt,
        isEligible: false,
        $inc: { donationCount: 1 },
      },
      { session }
    );

    // 3. If linked to a blood request, mark fulfilled (also in transaction)
    if (bloodRequest) {
      await BloodRequest.findByIdAndUpdate(
        bloodRequest,
        {
          $set: { 'assignedDonors.$[elem].status': 'donated' },
          status: 'fulfilled',
          fulfilledAt: new Date(),
        },
        { arrayFilters: [{ 'elem.donor': req.user._id }], session }
      );
    }

    // 4. Create confirmation notification (in transaction)
    await Notification.create(
      [
        {
          recipient: req.user._id,
          type: 'donation_confirmed',
          title: '🩸 Donation Recorded',
          message: `Thank you! Your donation of ${units} unit(s) of ${bloodType} has been recorded.`,
          relatedDonation: donation._id,
          priority: 'medium',
        },
      ],
      { session }
    );

    // Commit — all writes succeed or none do
    await session.commitTransaction();

    // Post-commit: real-time notification (non-critical, outside transaction)
    getIO().to(`user-${req.user._id}`).emit('newNotification', {
      type: 'donation_confirmed',
      title: 'Donation Recorded',
      message: `${units} unit(s) of ${bloodType}`,
    });

    await donation.populate('bloodBank', 'name address');
    res.status(201).json({ success: true, message: 'Donation logged successfully', data: donation });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/donations/my — donor's donation history
 */
export const getMyDonations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [donations, total] = await Promise.all([
      Donation.find({ donor: req.user._id })
        .populate('bloodBank', 'name address')
        .populate('bloodRequest', 'patientName hospital bloodType')
        .sort({ donatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Donation.countDocuments({ donor: req.user._id }),
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/donations — admin: all donations
 */
export const getAllDonations = async (req, res, next) => {
  try {
    const { bloodType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (bloodType) filter.bloodType = bloodType;

    const skip = (Number(page) - 1) * Number(limit);
    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'name email bloodType')
        .populate('bloodBank', 'name')
        .sort({ donatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Donation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};
