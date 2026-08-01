import { motion } from 'motion/react';

const RideSummaryCard = ({ pickup, drop, distance, duration, fare, vehicleType }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Ride Summary</h3>
      
      <div className="relative pl-6 space-y-4 mb-6">
        <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="relative">
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-success border-2 border-white shadow-sm" />
          <p className="text-xs text-text-secondary mb-0.5">Pickup</p>
          <p className="text-sm font-medium text-text-primary line-clamp-1">{pickup}</p>
        </div>
        <div className="relative">
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-danger border-2 border-white shadow-sm" />
          <p className="text-xs text-text-secondary mb-0.5">Drop</p>
          <p className="text-sm font-medium text-text-primary line-clamp-1">{drop}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-surface">
          <p className="text-xs text-text-secondary mb-1">Distance</p>
          <p className="font-semibold text-text-primary">{distance}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface">
          <p className="text-xs text-text-secondary mb-1">Duration</p>
          <p className="font-semibold text-text-primary">{duration}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-text-secondary">Total Fare ({vehicleType})</p>
          <p className="text-2xl font-bold text-primary">₹{fare}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RideSummaryCard;
