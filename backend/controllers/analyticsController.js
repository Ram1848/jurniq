const ecoService = require('../services/ecoService');

const getPersonalDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const stats = await ecoService.getPersonalAnalytics(userId);
    const monthly = await ecoService.getMonthlyAnalytics(userId);

    res.status(200).json({ success: true, stats, monthly });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const stats = await ecoService.getAdminEcoStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPersonalDashboard,
  getAdminDashboard
};
