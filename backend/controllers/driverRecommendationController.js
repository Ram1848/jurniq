const aiRecommendationService = require('../services/aiRecommendationService');

const getRecommendations = async (req, res) => {
  try {
    const { pickupLocation, vehicleType } = req.body;

    if (!pickupLocation || !vehicleType) {
      return res.status(400).json({ message: 'pickupLocation and vehicleType are required' });
    }

    const recommendedDrivers = await aiRecommendationService.recommendDrivers(pickupLocation, vehicleType);

    res.status(200).json({
      message: 'Recommendations generated successfully',
      drivers: recommendedDrivers
    });
  } catch (error) {
    console.error('Error in getRecommendations controller:', error);
    res.status(500).json({ message: 'Internal server error while generating recommendations' });
  }
};

module.exports = {
  getRecommendations
};
