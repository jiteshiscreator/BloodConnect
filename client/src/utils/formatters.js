import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { DONATION_COOLDOWN_DAYS } from './constants';

/**
 * Format a date as relative time (e.g., "2 hours ago").
 */
export const timeAgo = (date) => {
  if (!date) return 'Never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format a date as "May 25, 2024".
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

/**
 * Format a date as "May 25, 2024 at 8:30 AM".
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a');
};

/**
 * Days since a donor's last donation.
 */
export const daysSinceLastDonation = (lastDonated) => {
  if (!lastDonated) return null;
  return differenceInDays(new Date(), new Date(lastDonated));
};

/**
 * Days remaining until the donor is eligible again.
 */
export const daysUntilEligible = (lastDonated) => {
  if (!lastDonated) return 0;
  const daysSince = differenceInDays(new Date(), new Date(lastDonated));
  return Math.max(0, DONATION_COOLDOWN_DAYS - daysSince);
};

/**
 * Eligibility percentage (0–100) for progress indicator.
 */
export const eligibilityProgress = (lastDonated) => {
  if (!lastDonated) return 100;
  const daysSince = differenceInDays(new Date(), new Date(lastDonated));
  return Math.min(100, Math.round((daysSince / DONATION_COOLDOWN_DAYS) * 100));
};

/**
 * Format distance in km with one decimal place.
 */
export const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Capitalize first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format blood type for display (already formatted, just for safety).
 */
export const formatBloodType = (bt) => bt || '—';

/**
 * Format phone number for display.
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  return phone;
};
