import { motion } from 'motion/react';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineCurrencyRupee, HiOutlineMapPin, HiOutlineInformationCircle } from 'react-icons/hi2';

const NotificationCard = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'ride_accepted':
      case 'ride_completed':
        return <HiOutlineCheckCircle className="w-6 h-6 text-success" />;
      case 'ride_started':
        return <HiOutlineMapPin className="w-6 h-6 text-primary" />;
      case 'payment_success':
        return <HiOutlineCurrencyRupee className="w-6 h-6 text-accent" />;
      case 'admin':
      default:
        return <HiOutlineInformationCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'ride_accepted':
      case 'ride_completed':
        return 'bg-success/10';
      case 'ride_started':
        return 'bg-primary/10';
      case 'payment_success':
        return 'bg-accent/10';
      case 'admin':
      default:
        return 'bg-blue-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 flex gap-4 items-start ${!notification.is_read ? 'border-l-4 border-l-primary' : 'opacity-70'}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-semibold ${!notification.is_read ? 'text-text-primary' : 'text-text-secondary'}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-text-secondary whitespace-nowrap ml-4">
            {new Date(notification.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {notification.message}
        </p>
        {!notification.is_read && (
          <button
            onClick={() => onMarkRead(notification.notification_id)}
            className="mt-3 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Mark as read
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationCard;
