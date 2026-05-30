/**
 * Build a MongoDB $nearSphere geo query for finding documents within a radius.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - Search radius in meters (default: 10km)
 */
export const buildNearQuery = (lat, lng, radiusMeters = 10000) => ({
  $nearSphere: {
    $geometry: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON: [longitude, latitude]
    },
    $maxDistance: radiusMeters,
  },
});

/**
 * Build a GeoJSON Point object for storing user/bank location.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export const buildGeoPoint = (lat, lng) => ({
  type: 'Point',
  coordinates: [parseFloat(lng), parseFloat(lat)],
});

/**
 * Haversine distance between two coordinates (km).
 * Useful for sorting/displaying in API responses.
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
