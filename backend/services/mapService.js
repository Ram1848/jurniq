const { calculateFare } = require('./fareService');

const getFareEstimate = (distanceText, durationText, vehicleType) => {
  const distanceInKm = parseFloat(distanceText.replace(/[^\d.]/g, ''));
  const durationInMins = parseFloat(durationText.replace(/[^\d.]/g, ''));

  if (isNaN(distanceInKm) || isNaN(durationInMins)) {
    throw new Error('Invalid distance or duration format');
  }

  const vType = vehicleType || 'mini';
  const fare = calculateFare(distanceInKm, durationInMins, vType);

  return {
    distance: distanceText,
    distanceValue: distanceInKm,
    duration: durationText,
    durationValue: durationInMins,
    fare,
    vehicleType: vType,
  };
};

module.exports = { getFareEstimate };
