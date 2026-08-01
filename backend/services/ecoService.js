const { pool } = require('../config/db');

// Baseline CO2 emissions in grams per km
const EMISSION_RATES = {
  baseline_sedan: 192,
  bike: 100, // Saves 92g/km
  auto: 120, // Saves 72g/km
  mini: 150, // Saves 42g/km
  sedan: 192, // Saves 0
  suv: 250 // Saves 0
};

const calculateCO2Savings = (vehicleType, distanceKm) => {
  if (!distanceKm) return 0;
  const standardEmissions = EMISSION_RATES.baseline_sedan * distanceKm;
  const actualEmissions = (EMISSION_RATES[vehicleType] || EMISSION_RATES.sedan) * distanceKm;
  const savings = standardEmissions - actualEmissions;
  return savings > 0 ? savings / 1000 : 0; // Return in kg
};

const getBadgeTier = (co2SavedKg) => {
  if (co2SavedKg >= 500) return 'Platinum Rider';
  if (co2SavedKg >= 200) return 'Gold Rider';
  if (co2SavedKg >= 50) return 'Silver Rider';
  return 'Bronze Rider';
};

const getPersonalAnalytics = async (userId) => {
  // Fetch all completed rides for the user
  const [rides] = await pool.query(
    `SELECT * FROM rides WHERE rider_id = ? AND status = 'completed'`,
    [userId]
  );

  let totalRides = rides.length;
  let totalDistance = 0;
  let totalSpent = 0;
  let totalCO2Saved = 0;
  let greenRides = 0;

  const vehicleCounts = {};
  const pickupCounts = {};
  const dropCounts = {};

  rides.forEach(ride => {
    const dist = parseFloat(ride.distance || 0);
    const fare = parseFloat(ride.fare || 0);
    const vType = ride.vehicle_type;

    totalDistance += dist;
    totalSpent += fare;

    // Eco calculations
    totalCO2Saved += calculateCO2Savings(vType, dist);
    if (['bike', 'auto', 'mini'].includes(vType)) {
      greenRides++;
    }

    // Counts for favorites
    vehicleCounts[vType] = (vehicleCounts[vType] || 0) + 1;
    pickupCounts[ride.pickup_location] = (pickupCounts[ride.pickup_location] || 0) + 1;
    dropCounts[ride.drop_location] = (dropCounts[ride.drop_location] || 0) + 1;
  });

  const getFavorite = (countsObj) => {
    let max = 0;
    let favorite = 'N/A';
    for (const [key, value] of Object.entries(countsObj)) {
      if (value > max) {
        max = value;
        favorite = key;
      }
    }
    return favorite;
  };

  const avgDistance = totalRides > 0 ? (totalDistance / totalRides).toFixed(2) : 0;
  const avgCost = totalRides > 0 ? (totalSpent / totalRides).toFixed(2) : 0;
  // Assume avg speed of 30km/h
  const totalHours = (totalDistance / 30).toFixed(1);
  const greenPercentage = totalRides > 0 ? Math.round((greenRides / totalRides) * 100) : 0;

  return {
    totalRides,
    totalSharedRides: totalRides, // As per plan, all platform rides are 'shared'
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    avgCost: parseFloat(avgCost),
    avgDistance: parseFloat(avgDistance),
    totalHours: parseFloat(totalHours),
    favoriteVehicle: getFavorite(vehicleCounts),
    favoritePickup: getFavorite(pickupCounts),
    favoriteDrop: getFavorite(dropCounts),
    totalCO2Saved: parseFloat(totalCO2Saved.toFixed(2)),
    greenPercentage,
    ecoBadge: getBadgeTier(totalCO2Saved)
  };
};

const getMonthlyAnalytics = async (userId) => {
  // Get rides from the last 6 months
  const [rides] = await pool.query(
    `SELECT distance, fare, vehicle_type, created_at 
     FROM rides 
     WHERE rider_id = ? AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
     ORDER BY created_at ASC`,
    [userId]
  );

  const monthsMap = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('default', { month: 'short' });
    monthsMap[monthName] = { name: monthName, rides: 0, spending: 0, distance: 0, co2Saved: 0 };
  }

  rides.forEach(ride => {
    const d = new Date(ride.created_at);
    const monthName = d.toLocaleString('default', { month: 'short' });
    
    if (monthsMap[monthName]) {
      const dist = parseFloat(ride.distance || 0);
      monthsMap[monthName].rides++;
      monthsMap[monthName].spending += parseFloat(ride.fare || 0);
      monthsMap[monthName].distance += dist;
      monthsMap[monthName].co2Saved += calculateCO2Savings(ride.vehicle_type, dist);
    }
  });

  return Object.values(monthsMap).map(m => ({
    ...m,
    spending: parseFloat(m.spending.toFixed(2)),
    distance: parseFloat(m.distance.toFixed(2)),
    co2Saved: parseFloat(m.co2Saved.toFixed(2))
  }));
};

const getAdminEcoStats = async () => {
  const [rides] = await pool.query(`SELECT rider_id, distance, vehicle_type FROM rides WHERE status = 'completed'`);
  
  let totalPlatformCO2 = 0;
  let totalGreenRides = 0;
  const userStats = {};

  rides.forEach(ride => {
    const dist = parseFloat(ride.distance || 0);
    const savings = calculateCO2Savings(ride.vehicle_type, dist);
    totalPlatformCO2 += savings;
    
    if (['bike', 'auto', 'mini'].includes(ride.vehicle_type)) {
      totalGreenRides++;
    }

    if (!userStats[ride.rider_id]) {
      userStats[ride.rider_id] = { rides: 0, co2: 0 };
    }
    userStats[ride.rider_id].rides++;
    userStats[ride.rider_id].co2 += savings;
  });

  // Get Top Eco Riders
  const sortedRiders = Object.entries(userStats)
    .sort(([,a], [,b]) => b.co2 - a.co2)
    .slice(0, 5);

  const topRiders = [];
  for (const [userId, stats] of sortedRiders) {
    const [[user]] = await pool.query(`SELECT full_name FROM users WHERE user_id = ?`, [userId]);
    if (user) {
      topRiders.push({
        name: user.full_name,
        co2Saved: parseFloat(stats.co2.toFixed(2)),
        badge: getBadgeTier(stats.co2)
      });
    }
  }

  return {
    totalPlatformCO2: parseFloat(totalPlatformCO2.toFixed(2)),
    totalPlatformRides: rides.length,
    totalGreenRides,
    greenRidePercentage: rides.length > 0 ? Math.round((totalGreenRides / rides.length) * 100) : 0,
    topEcoRiders: topRiders
  };
};

module.exports = {
  getPersonalAnalytics,
  getMonthlyAnalytics,
  getAdminEcoStats
};
