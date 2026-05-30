import mongoose from 'mongoose';
import { BLOOD_TYPES } from '../utils/helpers.js';

const inventoryItemSchema = new mongoose.Schema(
  {
    units: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bloodBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Blood bank name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, default: 'Hyderabad', trim: true },
      state: { type: String, default: 'Telangana', trim: true },
      pincode: { type: String, trim: true },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    /** GeoJSON Point — [longitude, latitude] */
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
    /** Per blood type inventory */
    inventory: {
      'A+': { type: inventoryItemSchema, default: () => ({}) },
      'A-': { type: inventoryItemSchema, default: () => ({}) },
      'B+': { type: inventoryItemSchema, default: () => ({}) },
      'B-': { type: inventoryItemSchema, default: () => ({}) },
      'O+': { type: inventoryItemSchema, default: () => ({}) },
      'O-': { type: inventoryItemSchema, default: () => ({}) },
      'AB+': { type: inventoryItemSchema, default: () => ({}) },
      'AB-': { type: inventoryItemSchema, default: () => ({}) },
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' },
      is24x7: { type: Boolean, default: false },
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── 2dsphere index for geo-queries ──
bloodBankSchema.index({ location: '2dsphere' });
bloodBankSchema.index({ isActive: 1, isVerified: 1 });
// admin index — prevents full collection scans on getMyBloodBank
bloodBankSchema.index({ admin: 1 }, { unique: true });

/** Virtual to check if any blood type has stock */
bloodBankSchema.virtual('hasStock').get(function () {
  return BLOOD_TYPES.some((bt) => this.inventory[bt]?.units > 0);
});

/** Get total units across all blood types */
bloodBankSchema.virtual('totalUnits').get(function () {
  return BLOOD_TYPES.reduce((sum, bt) => sum + (this.inventory[bt]?.units || 0), 0);
});

const BloodBank = mongoose.model('BloodBank', bloodBankSchema);
export default BloodBank;
