const mapService = require('../services/mapService');

const getFareEstimate = (req, res) => {
  const { pickupLocation, dropLocation, distanceText, durationText, vehicleType } = req.body;

  if (!pickupLocation || !dropLocation || !distanceText || !durationText) {
    res.status(400);
    throw new Error('Please provide pickup, drop, distance, and duration');
  }

  try {
    const data = mapService.getFareEstimate(distanceText, durationText, vehicleType);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

module.exports = { getFareEstimate };
