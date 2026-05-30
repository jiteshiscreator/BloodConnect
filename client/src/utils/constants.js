export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ROLES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient',
  HOSPITAL: 'hospital',
  BLOODBANK_ADMIN: 'bloodbank_admin',
  SUPER_ADMIN: 'super_admin',
};

export const ROLE_LABELS = {
  donor: 'Blood Donor',
  recipient: 'Patient / Recipient',
  hospital: 'Hospital Staff',
  bloodbank_admin: 'Blood Bank Admin',
  super_admin: 'Super Admin',
};

export const URGENCY_LEVELS = [
  { value: 'critical', label: 'Critical', color: '#ff3333', bg: 'rgba(255,51,51,0.12)' },
  { value: 'high', label: 'High', color: '#FF4D6D', bg: 'rgba(220,20,60,0.15)' },
  { value: 'normal', label: 'Normal', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'matched', label: 'Matched', color: '#3b82f6' },
  { value: 'in_progress', label: 'In Progress', color: '#8b5cf6' },
  { value: 'fulfilled', label: 'Fulfilled', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
  { value: 'expired', label: 'Expired', color: '#4b5563' },
];

export const BLOOD_TYPE_COLORS = {
  'A+':  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'A-':  { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  'B+':  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'B-':  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  'O+':  { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'O-':  { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  'AB+': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'AB-': { color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

export const DONATION_COOLDOWN_DAYS = 56;

/** Hyderabad, India — default map center */
export const DEFAULT_MAP_CENTER = [17.385, 78.4867]; // [lat, lng] for Leaflet
export const DEFAULT_MAP_ZOOM = 12;
export const DEFAULT_RADIUS_KM = 10;

export const SOCKET_EVENTS = {
  JOIN_DONOR_ROOM: 'joinDonorRoom',
  JOIN_USER_ROOM: 'joinUserRoom',
  JOIN_HOSPITAL_ROOM: 'joinHospitalRoom',
  NEW_BLOOD_REQUEST: 'newBloodRequest',
  REQUEST_STATUS_UPDATE: 'requestStatusUpdate',
  INVENTORY_UPDATE: 'inventoryUpdate',
  NEW_NOTIFICATION: 'newNotification',
};

export const ROLE_DASHBOARD_PATHS = {
  donor: '/donor/dashboard',
  recipient: '/recipient/dashboard',
  hospital: '/hospital/dashboard',
  bloodbank_admin: '/bloodbank/dashboard',
  super_admin: '/admin/dashboard',
};
