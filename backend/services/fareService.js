// ──────────────────────────────────────────────
// Dynamic Fare Calculation Service
// ──────────────────────────────────────────────

const BASE_FARE = 30; // Minimum base fare in ₹

const VEHICLE_RATES = {
  bike: 8,
  auto: 10,
  mini: 12,
  sedan: 15,
  suv: 18,
};

/**
 * Calculate dynamic fare based on distance, duration, and vehicle type.
 * @param {number} distanceInKm - The distance in kilometers.
 * @param {number} durationInMins - The estimated duration in minutes (used for surge pricing if needed).
 * @param {string} vehicleType - 'bike', 'auto', 'mini', 'sedan', 'suv'.
 * @returns {number} The calculated fare.
 */
const calculateFare = (distanceInKm, durationInMins, vehicleType) => {
  const ratePerKm = VEHICLE_RATES[vehicleType] || VEHICLE_RATES.mini;

  // Calculate pure distance fare
  let fare = BASE_FARE + ratePerKm * distanceInKm;

  // Optional: Add time-based pricing (e.g., ₹1 per minute of estimated travel)
  // fare += (durationInMins * 1);

  // Round to nearest integer
  return Math.round(fare);
};

module.exports = {
  calculateFare,
  VEHICLE_RATES,
  BASE_FARE,
};
