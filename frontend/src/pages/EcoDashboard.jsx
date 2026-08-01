import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import EcoBadgeCard from '../components/Cards/EcoBadgeCard/EcoBadgeCard';
import { HiOutlineSparkles, HiOutlineUserGroup, HiOutlineGlobeAsiaAustralia } from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }) => (
  <div className="glass-card p-6 border-l-4" style={{ borderColor: 'currentColor' }} className={`glass-card p-6 border-l-4 ${colorClass.replace('text-', 'border-')}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-extrabold text-text-primary">{value}</h3>
        {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
      </div>
    </div>
  </div>
);

const EcoDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/admin');
        setStats(res.data.stats);
      } catch (error) {
        toast.error('Failed to load Eco Dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton height="150px" />
        <LoadingSkeleton height="300px" />
      </div>
    );
  }

  if (!stats) return <div className="p-6">Error loading dashboard</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">Platform Eco Impact</h1>
        <p className="text-text-secondary">Global environmental statistics and top rider leaderboards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={HiOutlineGlobeAsiaAustralia}
          label="Total CO₂ Prevented"
          value={`${stats.totalPlatformCO2} kg`}
          subtext="Across all platform rides"
          colorClass="text-emerald-500 border-emerald-500"
        />
        <StatCard 
          icon={HiOutlineUserGroup}
          label="Total Platform Rides"
          value={stats.totalPlatformRides}
          subtext="Completed rides"
          colorClass="text-blue-500 border-blue-500"
        />
        <StatCard 
          icon={HiOutlineSparkles}
          label="Green Ride Percentage"
          value={`${stats.greenRidePercentage}%`}
          subtext={`${stats.totalGreenRides} Eco-friendly rides`}
          colorClass="text-purple-500 border-purple-500"
        />
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-text-primary">Top 5 Eco Riders 🏆</h2>
          <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">Leaderboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.topEcoRiders.map((rider, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <EcoBadgeCard badge={rider.badge} co2Saved={rider.co2Saved} />
              <p className="text-center mt-3 font-bold text-text-primary">{rider.name}</p>
              <p className="text-center text-xs text-text-secondary uppercase tracking-wider">Rank #{idx + 1}</p>
            </motion.div>
          ))}
          {stats.topEcoRiders.length === 0 && (
            <p className="text-text-secondary text-sm">No rides completed yet to calculate leaderboard.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcoDashboard;
