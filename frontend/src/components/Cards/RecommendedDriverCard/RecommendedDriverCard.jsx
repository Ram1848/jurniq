import { motion } from 'motion/react';
import { HiStar, HiOutlineClock, HiOutlineMapPin, HiOutlineShieldCheck } from 'react-icons/hi2';

const RecommendedDriverCard = ({ driver, onSelect, selected }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onSelect(driver)}
      className={`relative glass-card p-5 cursor-pointer transition-all duration-300 ${
        selected ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10' : 'hover:border-primary/50'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.driver_name}`} 
              alt={driver.driver_name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow border border-gray-100 flex items-center gap-1">
            <HiStar className="w-3 h-3 text-warning" />
            <span className="text-xs font-bold text-text-primary">{driver.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-text-primary text-lg">{driver.driver_name}</h4>
          <p className="text-sm text-text-secondary mb-2">{driver.vehicle.toUpperCase()}</p>
          
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md text-text-secondary">
              <HiOutlineClock className="w-4 h-4" />
              <span>{driver.eta} min</span>
            </div>
            <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md text-text-secondary">
              <HiOutlineMapPin className="w-4 h-4" />
              <span>{driver.distance} km</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              driver.safety_score >= 90 ? 'bg-success/10 text-success' : 
              driver.safety_score >= 70 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
            }`}>
              <HiOutlineShieldCheck className="w-4 h-4" />
              <span>Safety: {driver.safety_score}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-text-secondary italic">
          <span className="text-primary font-semibold">AI Match:</span> {driver.reason}
        </p>
      </div>
    </motion.div>
  );
};

export default RecommendedDriverCard;
