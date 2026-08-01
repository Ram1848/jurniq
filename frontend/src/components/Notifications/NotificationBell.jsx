import { useState, useEffect, useRef } from 'react';
import { HiOutlineBell } from 'react-icons/hi2';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'motion/react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      setNotifications((prev) => [{ ...data, id: Date.now(), read: false }, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNotification);
    socket.on('rideAccepted', (data) => handleNotification({ title: 'Ride Accepted', message: 'A driver is on their way!' }));
    socket.on('rideStarted', (data) => handleNotification({ title: 'Ride Started', message: 'You are on your way!' }));
    socket.on('rideCompleted', (data) => handleNotification({ title: 'Ride Completed', message: 'You have arrived safely.' }));
    socket.on('rideCancelled', (data) => handleNotification({ title: 'Ride Cancelled', message: 'Your ride was cancelled.' }));
    socket.on('newRideRequest', (data) => handleNotification({ title: 'New Ride Request', message: 'A new rider is requesting a ride nearby.' }));

    return () => {
      socket.off('notification', handleNotification);
      socket.off('rideAccepted');
      socket.off('rideStarted');
      socket.off('rideCompleted');
      socket.off('rideCancelled');
      socket.off('newRideRequest');
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
        <HiOutlineBell className="w-6 h-6 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-text-secondary text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                    <p className="text-sm font-semibold text-text-primary">{notif.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
