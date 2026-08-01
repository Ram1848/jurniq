import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineStar,
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import * as driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import LiveDriverStatus from '../components/Cards/LiveDriverStatus';
import SafetyScoreCard from '../components/Cards/SafetyScoreCard/SafetyScoreCard';
import DriverPerformanceCard from '../components/Cards/DriverPerformanceCard/DriverPerformanceCard';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, histRes] = await Promise.all([
          driverService.getDriverDashboardStats(),
          driverService.getRideHistory(),
        ]);
        setStats(statsRes.stats);
        setRecentRides(histRes.rides.slice(0, 5));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Total Trips', key: 'totalTrips', icon: HiOutlineRocketLaunch, color: 'text-primary', bg: 'bg-primary/10', format: (v) => v },
    { label: 'Completed', key: 'completedTrips', icon: HiOutlineCheckCircle, color: 'text-success', bg: 'bg-success/10', format: (v) => v },
    { label: 'Earnings', key: 'totalEarnings', icon: HiOutlineBanknotes, color: 'text-accent', bg: 'bg-accent/10', format: (v) => `₹${v}` },
    { label: 'Rating', key: 'avgRating', icon: HiOutlineStar, color: 'text-warning', bg: 'bg-warning/10', format: (v) => v || 'N/A' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Driver Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {user?.full_name || 'Driver'} 🚗</p>
        </div>
        <Link to="/driver/ride-requests" className="btn-primary mt-4 sm:mt-0 no-underline">
          View Ride Requests
        </Link>
      </div>

      <div className="mb-8 max-w-sm">
        <LiveDriverStatus initialStatus="offline" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            {loading ? (
              <LoadingSkeleton width="80px" height="32px" />
            ) : (
              <p className="text-3xl font-bold text-text-primary">{card.format(stats?.[card.key] ?? 0)}</p>
            )}
            <p className="text-sm text-text-secondary mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Safety & Performance */}
      {!loading && stats?.metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <SafetyScoreCard 
              score={stats.metrics.safety_score} 
              tier={
                stats.metrics.safety_score >= 95 ? 'Trusted Driver' :
                stats.metrics.safety_score >= 80 ? 'Reliable Driver' :
                stats.metrics.safety_score >= 60 ? 'Average Driver' : 'Needs Improvement'
              } 
            />
          </div>
          <div className="lg:col-span-2">
            <DriverPerformanceCard metrics={stats.metrics} />
          </div>
        </div>
      )}

      {/* Recent Rides Chart */}
      {!loading && recentRides.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Recent Trip Earnings (₹)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentRides.map((r, i) => ({ name: `Trip ${recentRides.length - i}`, fare: parseFloat(r.fare) })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="fare" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Recent activity */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton height="44px" count={3} />
          </div>
        ) : recentRides.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <p className="text-4xl mb-3">🚗</p>
            <p>No rides yet. Accept your first ride request!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-text-secondary">
                  <th className="text-left px-6 py-3 font-medium">#</th>
                  <th className="text-left px-6 py-3 font-medium">Rider</th>
                  <th className="text-left px-6 py-3 font-medium">Pickup</th>
                  <th className="text-left px-6 py-3 font-medium">Drop</th>
                  <th className="text-left px-6 py-3 font-medium">Fare</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride) => (
                  <tr key={ride.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-text-primary">{ride.ride_id}</td>
                    <td className="px-6 py-4 text-text-secondary">{ride.rider_name}</td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[130px]">{ride.pickup_location}</td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[130px]">{ride.drop_location}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">₹{ride.fare}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                        {ride.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{new Date(ride.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
