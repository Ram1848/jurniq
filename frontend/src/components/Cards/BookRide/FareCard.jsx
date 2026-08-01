import { motion } from 'motion/react';
import { FaMotorcycle, FaCarSide, FaCar, FaTruckPickup } from 'react-icons/fa';
import { MdElectricRickshaw } from 'react-icons/md';

const vehicleIcons = {
  bike: FaMotorcycle,
  auto: MdElectricRickshaw,
  mini: FaCar,
  sedan: FaCarSide,
  suv: FaTruckPickup,
};

const vehicleLabels = {
  bike: 'Bike',
  auto: 'Auto',
  mini: 'Mini',
  sedan: 'Sedan',
  suv: 'SUV',
};

const FareCard = ({ vehicleType, fare, durationText, isSelected, onClick }) => {
  const Icon = vehicleIcons[vehicleType] || FaCar;
  const label = vehicleLabels[vehicleType] || 'Car';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
          : 'border-gray-100 hover:border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="font-bold text-text-primary text-lg">{label}</p>
          <p className="text-xs text-text-secondary">{durationText} away</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-text-primary">₹{fare}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl rounded-tr-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.button>
  );
};

export default FareCard;
