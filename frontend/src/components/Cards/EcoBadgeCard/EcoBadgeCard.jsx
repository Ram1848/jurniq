import { motion } from 'motion/react';
import { HiOutlineSparkles, HiOutlineStar, HiOutlineTrophy } from 'react-icons/hi2';

const badges = {
  'Bronze Rider': { color: 'from-amber-700 to-amber-900', icon: HiOutlineStar, next: 'Silver Rider', target: 50 },
  'Silver Rider': { color: 'from-gray-300 to-gray-500', icon: HiOutlineSparkles, next: 'Gold Rider', target: 200 },
  'Gold Rider': { color: 'from-yellow-400 to-yellow-600', icon: HiOutlineTrophy, next: 'Platinum Rider', target: 500 },
  'Platinum Rider': { color: 'from-cyan-300 to-blue-500', icon: HiOutlineSparkles, next: 'Max Tier', target: 500 }
};

const EcoBadgeCard = ({ badge, co2Saved }) => {
  const badgeInfo = badges[badge] || badges['Bronze Rider'];
  const progress = Math.min((co2Saved / badgeInfo.target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-3xl p-8 text-white bg-gradient-to-br ${badgeInfo.color} shadow-2xl`}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Current Tier</p>
            <h2 className="text-3xl font-extrabold flex items-center gap-2">
              <badgeInfo.icon className="w-8 h-8" />
              {badge}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Total CO₂ Saved</p>
            <p className="text-3xl font-extrabold">{co2Saved} <span className="text-lg font-medium text-white/80">kg</span></p>
          </div>
        </div>

        {badge !== 'Platinum Rider' && (
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-white/90">Progress to {badgeInfo.next}</span>
              <span className="text-white">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            </div>
            <p className="text-xs text-white/70 mt-2 text-right">{badgeInfo.target - co2Saved} kg remaining</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EcoBadgeCard;
