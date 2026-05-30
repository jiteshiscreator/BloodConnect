import { body, query } from 'express-validator';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/error.middleware.js';
import { buildNearQuery } from '../utils/geoQuery.js';
import { getIO } from '../config/socket.js';
import { sendEmergencyAlert, sendRequestStatusUpdate } from '../services/email.service.js';

// ── Validation ────────────────────────────────────────────
export const createRequestValidation = [
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('bloodType').isIn(['A+','A-','B+','B-','O+','O-','AB+','AB-']).withMessage('Valid blood type required'),
  body('units').isInt({ min: 1, max: 20 }).withMessage('Units must be between 1 and 20'),
  body('urgency').isIn(['critical', 'high', 'normal']).withMessage('Invalid urgency level'),
  body('hospital.name').notEmpty().withMessage('Hospital name is required'),
  body('lat').isFloat().withMessage('Valid latitude required'),
  body('lng').isFloat().withMessage('Valid longitude required'),
];

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/requests — create a new blood request
 */
export const createRequest = async (req, res, next) => {
  try {
    const { patientName, bloodType, units, urgency, hospital, lat, lng, city, notes, expiresAt } = req.body;

    const payload = {
      patientName,
      bloodType,
      units,
      urgency,
      hospital,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      city: (city || 'Hyderabad').toLowerCase(),
      requestedBy: req.user._id,
      notes,
    };

    // Only assign if it actually exists, forcing Mongoose to use the Schema Default if not!
    if (expiresAt) {
        const expiry = new Date(expiresAt);
        if (expiry <= new Date()) throw new AppError('expiresAt must be a future date', 400);
        payload.expiresAt = expiry;
    }

    const request = await BloodRequest.create(payload);

    // ── Notify nearby eligible donors via Socket.IO ──
    const io = getIO();
    const room = `blood-${bloodType}-${(city || 'hyderabad').toLowerCase()}`;
    
    // Broadcast the new request with matching exact MongoDB schema structure
    // so the Frontend's RequestCard can render it seamlessly.
    const socketPayload = {
      _id: request._id,
      patientName,
      bloodType,
      units,
      urgency,
      hospital: { name: hospital.name, address: hospital.address },
      city,
      status: 'pending',
      createdAt: request.createdAt,
    };
    
    // Donors globally listening will verify eligibility on frontend for now, or you can room it.
    // We emit globally so Hospitals and Admins get the update in real-time.
    io.emit('newBloodRequest', socketPayload);

    // ── Create in-app notifications for nearby donors ──
    const nearbyDonors = await User.find({
      role: 'donor',
      bloodType,
      isEligible: true,
      isActive: true,
      location: buildNearQuery(lat, lng, 15000), // 15km
    }).select('_id email name');

    if (nearbyDonors.length > 0) {
      const notifications = nearbyDonors.map((donor) => ({
        recipient: donor._id,
        type: 'emergency_alert',
        title: `🚨 ${urgency.toUpperCase()}: ${bloodType} Blood Needed`,
        message: `${units} unit(s) needed at ${hospital.name}. You are nearby and eligible.`,
        relatedRequest: request._id,
        priority: urgency === 'critical' ? 'urgent' : urgency === 'high' ? 'high' : 'medium',
        actionUrl: '/donor/dashboard',
      }));
      await Notification.insertMany(notifications);

      // Emit to individual user rooms
      nearbyDonors.forEach((donor) => {
        io.to(`user-${donor._id}`).emit('newNotification', {
          type: 'emergency_alert',
          title: `🚨 ${bloodType} Blood Needed`,
          message: `At ${hospital.name}`,
          requestId: request._id,
        });
      });

      // Send email alerts asynchronously (non-blocking)
      if (urgency !== 'normal') {
        Promise.allSettled(
          nearbyDonors.slice(0, 10).map((donor) => sendEmergencyAlert(donor, request))
        ).catch(() => {});
      }
    }

    await request.populate('requestedBy', 'name email');
    res.status(201).json({ success: true, message: 'Blood request created', data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests — paginated list (role-filtered)
 */
export const getRequests = async (req, res, next) => {
  try {
    const { status, bloodType, urgency, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (bloodType) filter.bloodType = bloodType;
    if (urgency) filter.urgency = urgency;

    // Recipients only see their own requests
    if (req.user.role === 'recipient') {
      filter.requestedBy = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate('requestedBy', 'name email role')
        .populate('assignedDonors.donor', 'name bloodType phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests/nearby — requests near a donor
 */
export const getNearbyRequests = async (req, res, next) => {
  try {
    const { lat, lng, radius = 15000 } = req.query;
    const userLat = lat || req.user.location?.coordinates[1];
    const userLng = lng || req.user.location?.coordinates[0];

    const requests = await BloodRequest.find({
      status: 'pending',
      bloodType: req.user.bloodType,
      // Close the 14-minute cron window: filter out expired requests inline
      expiresAt: { $gt: new Date() },
      location: buildNearQuery(userLat, userLng, Number(radius)),
    })
      .populate('requestedBy', 'name')
      .sort({ urgency: 1, createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests/:id
 */
export const getRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('assignedDonors.donor', 'name bloodType phone email')
      .populate('bloodBank', 'name address phone');

    if (!request) throw new AppError('Blood request not found', 404);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/requests/:id/status — update request status
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, donorId } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found', 404);

    // Authorization: only the request creator, a hospital, or super_admin may update status
    const isOwner = request.requestedBy.toString() === req.user._id.toString();
    const isPrivileged = ['hospital', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      throw new AppError('Not authorized to update this request status', 403);
    }

    request.status = status;
    if (status === 'fulfilled') request.fulfilledAt = new Date();

    // Add donor to assigned list if matching
    if (donorId && status === 'matched') {
      const alreadyAssigned = request.assignedDonors.some((d) => d.donor.toString() === donorId);
      if (!alreadyAssigned) {
        request.assignedDonors.push({ donor: donorId, status: 'accepted' });
      }
    }

    await request.save();

    // Notify requester
    const requester = await User.findById(request.requestedBy);
    if (requester) {
      await Notification.create({
        recipient: requester._id,
        type: 'request_update',
        title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your request for ${request.patientName} has been ${status}.`,
        relatedRequest: request._id,
        actionUrl: '/recipient/dashboard',
      });

      getIO().to(`user-${requester._id}`).emit('requestStatusUpdate', {
        requestId: request._id,
        status,
        patientName: request.patientName,
      });

      // Send email non-blocking
      sendRequestStatusUpdate(requester, request).catch(() => {});
    }

    res.json({ success: true, message: 'Request status updated', data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/requests/:id — cancel a request
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found', 404);

    // Only owner or admin/hospital can cancel
    if (
      request.requestedBy.toString() !== req.user._id.toString() &&
      !['super_admin', 'hospital'].includes(req.user.role)
    ) {
      throw new AppError('Not authorized to cancel this request', 403);
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests/stats — admin dashboard stats
 */
export const getRequestStats = async (req, res, next) => {
  try {
    const stats = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const urgencyStats = await BloodRequest.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    const bloodTypeStats = await BloodRequest.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: { byStatus: stats, byUrgency: urgencyStats, byBloodType: bloodTypeStats } });
  } catch (error) {
    next(error);
  }
};
