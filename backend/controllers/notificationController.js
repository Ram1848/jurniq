const notificationService = require('../services/notificationService');
const { sendResponse, sendError } = require('../utils/validators');

const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.user_id);
    sendResponse(res, 200, 'Notifications retrieved', { notifications });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.user_id);
    sendResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.user_id);
    sendResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};
