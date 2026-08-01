import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  HiOutlineRocketLaunch,
  HiOutlineSignal,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import * as rideService from '../services/rideService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import RideStatusCard from '../components/Cards/RideStatusCard';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const RiderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, ridesRes] = await Promise.all([
          rideService.getDashboardStats(),
          rideService.getHistory(),
        ]);
        setStats(statsRes.stats);
        setRides(ridesRes.rides.slice(0, 5));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'Total Rides', key: 'totalRides', icon: HiOutlineRocketLaunch, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Rides', key: 'activeRides', icon: HiOutlineSignal, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Completed', key: 'completedRides', icon: HiOutlineCheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Cancelled', key: 'cancelledRides', icon: HiOutlineXCircle, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {user?.full_name || 'Rider'} 👋</p>
        </div>
        <Link to="/book-ride" className="btn-primary mt-4 sm:mt-0 no-underline">
          <HiOutlinePlus className="w-5 h-5" /> Book New Ride
        </Link>
      </div>

      {/* Active Ride Status */}
      {!loading && rides.length > 0 && ['pending', 'accepted', 'in_progress'].includes(rides[0].status) && (
        <div className="mb-8 max-w-2xl">
          <RideStatusCard rideId={rides[0].ride_id} initialStatus={rides[0].status} />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
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
              <LoadingSkeleton width="60px" height="32px" />
            ) : (
              <p className="text-3xl font-bold text-text-primary">{stats?.[card.key] ?? 0}</p>
            )}
            <p className="text-sm text-text-secondary mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Rides Chart */}
      {!loading && rides.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Recent Ride Fares (₹)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rides.map((r, i) => ({ name: `Ride ${rides.length - i}`, fare: parseFloat(r.fare) })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="fare" fill="#0A84FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Recent rides */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-text-primary">Recent Rides</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton height="44px" count={3} />
          </div>
        ) : rides.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <p className="mb-4">No rides yet</p>
            <Link to="/book-ride" className="btn-primary no-underline text-sm">Book Your First Ride</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-text-secondary">
                  <th className="text-left px-6 py-3 font-medium">#</th>
                  <th className="text-left px-6 py-3 font-medium">Pickup</th>
                  <th className="text-left px-6 py-3 font-medium">Drop</th>
                  <th className="text-left px-6 py-3 font-medium">Fare</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-text-primary font-medium">{ride.ride_id}</td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[150px]">{ride.pickup_location}</td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[150px]">{ride.drop_location}</td>
                    <td className="px-6 py-4 text-text-primary font-semibold">₹{ride.fare}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                        {ride.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(ride.created_at).toLocaleDateString()}
                    </td>
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

export default RiderDashboard;
