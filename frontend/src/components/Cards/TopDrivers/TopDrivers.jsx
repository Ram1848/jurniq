import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineTrophy, HiOutlineShieldExclamation, HiStar } from 'react-icons/hi2';
import api from '../../../services/api';

const TopDrivers = () => {
  // In a real implementation, this would fetch from an admin endpoint
  // For now, we mock the data to show the UI structure
  const [activeTab, setActiveTab] = useState('top');
  
  const mockTopDrivers = [
    { name: 'Michael T.', rating: 4.9, safety: 100, rides: 1250 },
    { name: 'Sarah J.', rating: 4.9, safety: 98, rides: 890 },
    { name: 'David C.', rating: 4.8, safety: 97, rides: 2100 }
  ];

  const mockAtRiskDrivers = [
    { name: 'John D.', rating: 3.5, safety: 55, rides: 120 },
    { name: 'Robert B.', rating: 3.2, safety: 48, rides: 85 },
    { name: 'Alex M.', rating: 2.9, safety: 40, rides: 42 }
  ];

  const drivers = activeTab === 'top' ? mockTopDrivers : mockAtRiskDrivers;

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Driver Safety Rankings</h3>
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'top' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'risk' ? 'bg-white text-danger shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            At Risk
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {drivers.map((driver, idx) => (
          <motion.div
            key={driver.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-surface border border-transparent hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                activeTab === 'top' 
                  ? (idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400')
                  : 'bg-danger/80'
              }`}>
                {activeTab === 'top' ? <HiOutlineTrophy className="w-5 h-5" /> : <HiOutlineShieldExclamation className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary">{driver.name}</h4>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="flex items-center gap-0.5"><HiStar className="w-3 h-3 text-warning"/> {driver.rating}</span>
                  <span>•</span>
                  <span>{driver.rides} rides</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-extrabold ${activeTab === 'top' ? 'text-success' : 'text-danger'}`}>
                {driver.safety}
              </div>
              <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Safety</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopDrivers;
