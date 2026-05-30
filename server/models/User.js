import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { BLOOD_TYPES, ROLES } from '../utils/helpers.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodType: {
      type: String,
      enum: [...BLOOD_TYPES, null, undefined],
    },
    city: {
      type: String,
      default: 'Hyderabad',
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
        default: [78.4867, 17.385], // Hyderabad default
      },
    },
    /** For donors: eligibility tracking */
    isEligible: {
      type: Boolean,
      default: true,
    },
    lastDonated: {
      type: Date,
      default: null,
    },
    donationCount: {
      type: Number,
      default: 0,
    },
    /** Health screening fields */
    healthScreening: {
      weight: Number,
      hemoglobin: Number,
      bloodPressure: String,
      isScreened: { type: Boolean, default: false },
      screenedAt: Date,
    },
    /** For hospital users */
    hospitalName: {
      type: String,
      trim: true,
    },
    /** For bloodbank_admin users */
    bloodBankRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
    },
    /** Account status */
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

// ── 2dsphere index for geo queries ──
userSchema.index({ location: '2dsphere' });

// ── Compound index for donor searches ──
userSchema.index({ role: 1, bloodType: 1, isEligible: 1, isActive: 1 });

// ── Hash password before saving ──
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare entered password with hashed password ──
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Remove sensitive fields from JSON output ──
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
