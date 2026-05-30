import mongoose from 'mongoose';
import { BLOOD_TYPES } from '../utils/helpers.js';

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodType: {
      type: String,
      required: [true, 'Blood type is required'],
      enum: BLOOD_TYPES,
    },
    units: {
      type: Number,
      required: [true, 'Number of units is required'],
      min: [1, 'Minimum 1 unit required'],
      max: [20, 'Maximum 20 units per request'],
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'normal'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'matched', 'in_progress', 'fulfilled', 'cancelled', 'expired'],
      default: 'pending',
    },
    hospital: {
      name: { type: String, required: true },
      address: { type: String },
    },
    /** GeoJSON Point for geo-queries — hospital location */
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [78.4867, 17.385],
      },
    },
    city: {
      type: String,
      default: 'Hyderabad',
      lowercase: true,
    },
    /** The user who created this request (recipient or hospital staff) */
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Donors who have responded / been matched */
    assignedDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined', 'donated'],
          default: 'pending',
        },
        respondedAt: Date,
      },
    ],
    /** Linked blood bank if sourced from inventory */
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h default
    },
    fulfilledAt: Date,
  },
  { timestamps: true }
);

// ── 2dsphere index for $nearSphere queries ──
bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodType: 1, city: 1 });
bloodRequestSchema.index({ requestedBy: 1, createdAt: -1 });
// Expiry index — speeds up the inline $gt filter and the cron job
bloodRequestSchema.index({ expiresAt: 1, status: 1 });

// ── Auto-expire: update status to 'expired' if past expiresAt ──
bloodRequestSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
