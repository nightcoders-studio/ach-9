const { success, error } = require('../utils/response');
const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
  try {
    const { is_read, type, page = 1, limit = 10 } = req.query;
    const result = await notificationModel.getNotifications({
      user_id: req.user.id,
      is_read,
      type,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetNotifications error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get notifications');
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.markAsRead(req.params.id, req.user.id);
    if (!notification) {
      return error(res, 404, 'NOT_FOUND', 'Notification not found');
    }
    return success(res, 'Notification marked as read', notification);
  } catch (err) {
    console.error('MarkAsRead error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to mark notification as read');
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationModel.markAllAsRead(req.user.id);
    return success(res, 'All notifications marked as read', result);
  } catch (err) {
    console.error('MarkAllAsRead error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to mark notifications as read');
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.getUnreadCount(req.user.id);
    return success(res, null, { unread_count: count });
  } catch (err) {
    console.error('GetUnreadCount error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get unread count');
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };