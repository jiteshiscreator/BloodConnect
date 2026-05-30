import jwt from 'jsonwebtoken';

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ROLES = ['donor', 'recipient', 'hospital', 'bloodbank_admin', 'super_admin'];

/** Days a donor must wait between donations */
export const DONATION_COOLDOWN_DAYS = 56;

/** Generate signed JWT access token (15 minutes) */
export const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

/** Generate signed JWT refresh token (7 days) */
export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

/** Cookie options shared between access and refresh tokens */
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

export const ACCESS_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const REFRESH_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Set access + refresh tokens in httpOnly cookies on the response.
 */
export const sendTokenCookies = (res, user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

  return { accessToken, refreshToken };
};

/**
 * Clear auth cookies.
 */
export const clearTokenCookies = (res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
};

/**
 * Check if a donor is eligible to donate (56-day cooldown).
 * @param {Date|null} lastDonated
 */
export const isDonorEligible = (lastDonated) => {
  if (!lastDonated) return true;
  const daysSince = (Date.now() - new Date(lastDonated).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= DONATION_COOLDOWN_DAYS;
};

/**
 * Days until a donor is eligible again.
 * @param {Date|null} lastDonated
 */
export const daysUntilEligible = (lastDonated) => {
  if (!lastDonated) return 0;
  const daysSince = (Date.now() - new Date(lastDonated).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(DONATION_COOLDOWN_DAYS - daysSince));
};
