import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineCheck } from 'react-icons/hi2';
import api from '../services/api';
import NotificationCard from '../components/Cards/NotificationCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      /* silent */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n)
      );
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center relative">
            <HiOutlineBell className="w-6 h-6 text-primary" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                {unreadCount}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary text-sm">Stay updated with your ride activities</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-lg text-sm font-medium transition-colors"
          >
            <HiOutlineCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton height="100px" count={4} />
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineBell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">All caught up!</h3>
            <p className="text-text-secondary mt-1">You don't have any notifications right now.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationCard
              key={notification.notification_id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
