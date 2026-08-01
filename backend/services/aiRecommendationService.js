const { pool } = require('../config/db');
const { getSafetyTier } = require('./safetyScoreService');

/**
 * AI Driver Recommendation Engine
 * Recommends the best driver based on multiple weighted metrics.
 */
const recommendDrivers = async (pickupLocation, vehicleType) => {
  try {
    // 1. Fetch available drivers for the given vehicle type
    const [drivers] = await pool.query(
      `SELECT d.*, u.full_name as driver_name
       FROM drivers d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.vehicle_type = ? AND d.availability_status = 'available'`,
      [vehicleType]
    );

    if (drivers.length === 0) {
      return [];
    }

    // 2. Score each driver based on the requested algorithm
    const scoredDrivers = drivers.map(driver => {
      // Mock ETA and Distance since we don't have real-time driver coordinates
      // In a real app, this would use mapService distance matrix.
      // We generate deterministic-looking pseudo-randoms based on driver_id to keep it realistic
      const distance = parseFloat(((driver.user_id % 5) + 0.5 + Math.random()).toFixed(1)); // 0.5km to 6km
      const eta = Math.round(distance * 3 + Math.random() * 5); // 3 mins per km + random delay

      const totalRides = driver.completed_rides + driver.cancelled_rides;
      const completionRate = totalRides > 0 ? (driver.completed_rides / totalRides) * 100 : 100;
      const cancellationRate = totalRides > 0 ? (driver.cancelled_rides / totalRides) * 100 : 0;
      
      const rating = parseFloat(driver.driver_rating || 5.0);
      const safetyScore = parseInt(driver.safety_score || 100);

      // Weight Calculation
      // 40% Driver Rating (Rating / 5 * 100 * 0.4)
      const wRating = (rating / 5) * 40;
      
      // 20% Distance (Inverse: closer is better. Max realistic is 10km)
      const wDistance = Math.max(0, (1 - (distance / 10)) * 20);
      
      // 15% Completion Rate (Rate * 0.15)
      const wCompletion = completionRate * 0.15;
      
      // 10% Cancellation Rate (Inverse: 100% cancellation = 0 points)
      const wCancellation = Math.max(0, (1 - (cancellationRate / 100)) * 10);
      
      // 10% Safety Score (Score * 0.1)
      const wSafety = safetyScore * 0.10;
      
      // 5% ETA (Inverse: Faster is better. Max realistic is 30 mins)
      const wEta = Math.max(0, (1 - (eta / 30)) * 5);

      const recommendationScore = Math.round(wRating + wDistance + wCompletion + wCancellation + wSafety + wEta);

      // Generate reason
      let reason = "Solid overall performance";
      if (wDistance >= 18) reason = "Closest to your location";
      else if (rating >= 4.9 && wRating >= 38) reason = "Top-rated driver";
      else if (safetyScore >= 98) reason = "Outstanding safety record";
      else if (eta < 5) reason = "Fastest arrival time";

      return {
        driver_id: driver.user_id,
        driver_name: driver.driver_name,
        vehicle: driver.vehicle_number,
        rating: rating,
        distance: distance,
        eta: eta,
        safety_score: safetyScore,
        safety_tier: getSafetyTier(safetyScore),
        recommendation_score: recommendationScore,
        reason: reason
      };
    });

    // 3. Sort by recommendation score descending and return Top 3
    scoredDrivers.sort((a, b) => b.recommendation_score - a.recommendation_score);
    
    return scoredDrivers.slice(0, 3);
  } catch (error) {
    console.error("Error generating driver recommendations:", error.message);
    throw error;
  }
};

module.exports = {
  recommendDrivers
};
