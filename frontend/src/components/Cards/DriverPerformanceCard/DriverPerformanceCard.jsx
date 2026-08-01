import { motion } from 'motion/react';
import { HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

const DriverPerformanceCard = ({ metrics }) => {
  const totalRides = (metrics.completed_rides || 0) + (metrics.cancelled_rides || 0);
  const completionRate = totalRides > 0 ? ((metrics.completed_rides / totalRides) * 100).toFixed(1) : 100;
  const cancellationRate = totalRides > 0 ? ((metrics.cancelled_rides / totalRides) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <HiOutlineChartBar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Performance Metrics</h3>
          <p className="text-xs text-text-secondary">Lifetime statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Completion Rate */}
        <div className="bg-surface rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineCheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-semibold text-text-secondary uppercase">Completion</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-extrabold text-text-primary">{completionRate}</span>
            <span className="text-sm font-medium text-text-secondary mb-1">%</span>
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-surface rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineXCircle className="w-4 h-4 text-danger" />
            <span className="text-xs font-semibold text-text-secondary uppercase">Cancellation</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-extrabold text-text-primary">{cancellationRate}</span>
            <span className="text-sm font-medium text-text-secondary mb-1">%</span>
          </div>
        </div>

        {/* Total Rides */}
        <div className="bg-surface rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase">Total Trips</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-extrabold text-text-primary">{metrics.completed_rides || 0}</span>
          </div>
        </div>

        {/* Complaints */}
        <div className="bg-surface rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-text-secondary uppercase">Complaints</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-extrabold text-text-primary">{metrics.complaints || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverPerformanceCard;
