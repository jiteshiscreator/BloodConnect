import Notification from '../models/Notification.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * GET /api/notifications — current user's notifications (paginated)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('relatedRequest', 'patientName bloodType hospital urgency status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read — mark a single notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all — mark all as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id — delete a notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
