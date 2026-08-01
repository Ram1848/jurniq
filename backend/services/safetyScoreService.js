const { pool } = require('../config/db');

/**
 * Calculates and updates the safety score for a given driver.
 * Formula is weighted to penalize cancellations, complaints, and late arrivals
 * while rewarding high ratings and consistent ride completions.
 */
const recalculateScore = async (driver_id) => {
  try {
    // 1. Fetch current metrics
    const [rows] = await pool.query(
      `SELECT driver_rating, completed_rides, cancelled_rides, complaints, late_arrivals 
       FROM drivers WHERE user_id = ?`,
      [driver_id]
    );

    if (rows.length === 0) return null;

    const metrics = rows[0];
    const totalRides = metrics.completed_rides + metrics.cancelled_rides;
    
    // Default base score
    let score = 100;

    // Penalty for cancellations (up to 20 points)
    if (totalRides > 0) {
      const cancellationRate = metrics.cancelled_rides / totalRides;
      score -= (cancellationRate * 100) * 0.5; // lose 0.5 points per 1% cancellation
    }

    // Penalty for complaints (5 points each)
    score -= (metrics.complaints * 5);

    // Penalty for late arrivals (2 points each)
    score -= (metrics.late_arrivals * 2);

    // Rating adjustment (Rating * 20 -> 5.0 rating = 100, 1.0 rating = 20)
    // We blend the base score with the rating score
    const ratingScore = metrics.driver_rating * 20;
    
    // Final weighted score: 70% behavior metrics, 30% rider rating
    let finalScore = Math.round((score * 0.7) + (ratingScore * 0.3));

    // Cap between 0 and 100
    if (finalScore > 100) finalScore = 100;
    if (finalScore < 0) finalScore = 0;

    // 2. Update the drivers table
    await pool.query(
      `UPDATE drivers SET safety_score = ? WHERE user_id = ?`,
      [finalScore, driver_id]
    );

    return finalScore;
  } catch (error) {
    console.error(`Error recalculating safety score for driver ${driver_id}:`, error.message);
    throw error;
  }
};

/**
 * Helper to determine the textual tier of the safety score.
 */
const getSafetyTier = (score) => {
  if (score >= 95) return 'Trusted Driver';
  if (score >= 80) return 'Reliable Driver';
  if (score >= 60) return 'Average Driver';
  return 'Needs Improvement';
};

module.exports = {
  recalculateScore,
  getSafetyTier
};
