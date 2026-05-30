import mongoose from 'mongoose';
import { BLOOD_TYPES } from '../utils/helpers.js';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    bloodType: {
      type: String,
      required: [true, 'Blood type is required'],
      enum: BLOOD_TYPES,
    },
    units: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 unit'],
      max: [2, 'Maximum 2 units per donation'],
      default: 1,
    },
    donatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'completed',
    },
    certificate: {
      type: String, // URL to donation certificate
    },
    notes: {
      type: String,
      maxlength: 300,
    },
    /** Health checks recorded at time of donation */
    vitalSigns: {
      weight: Number,
      hemoglobin: Number,
      bloodPressure: String,
      pulse: Number,
    },
  },
  { timestamps: true }
);

donationSchema.index({ donor: 1, donatedAt: -1 });
donationSchema.index({ bloodBank: 1, donatedAt: -1 });
donationSchema.index({ bloodRequest: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
