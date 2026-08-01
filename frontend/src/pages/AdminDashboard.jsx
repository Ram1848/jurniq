import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineSignal,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import TopDrivers from '../components/Cards/TopDrivers/TopDrivers';
import EmergencyDashboard from '../components/Cards/EmergencyDashboard/EmergencyDashboard';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, ridesRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAllRides(),
        ]);
        setStats(statsRes.stats);
        setRides(ridesRes.rides.slice(0, 8));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Total Users', key: 'totalUsers', icon: HiOutlineUsers, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Total Drivers', key: 'totalDrivers', icon: HiOutlineTruck, gradient: 'from-violet-500 to-purple-400' },
    { label: 'Total Rides', key: 'totalRides', icon: HiOutlineMapPin, gradient: 'from-orange-500 to-amber-400' },
    { label: 'Active Rides', key: 'activeRides', icon: HiOutlineSignal, gradient: 'from-emerald-500 to-green-400' },
    { label: 'Completed', key: 'completedRides', icon: HiOutlineCheckCircle, gradient: 'from-primary to-blue-400' },
    { label: 'Revenue', key: 'revenue', icon: HiOutlineBanknotes, gradient: 'from-pink-500 to-rose-400', format: (v) => `₹${v}` },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white relative overflow-hidden`}
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <card.icon className="w-8 h-8 text-white/80" />
                <span className="text-xs font-medium text-white/60 uppercase tracking-wide">{card.label}</span>
              </div>
              {loading ? (
                <div className="h-9 w-24 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                <p className="text-3xl font-extrabold">
                  {card.format ? card.format(stats?.[card.key] ?? 0) : (stats?.[card.key] ?? 0)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Alerts Dashboard */}
      <div className="mb-8">
        <EmergencyDashboard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Rides Chart */}
        <div className="lg:col-span-2">
          {!loading && rides.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 h-full">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Recent Fares (₹)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rides.map(r => ({ name: `Ride #${r.ride_id}`, fare: parseFloat(r.fare) }))}>
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
        </div>

        {/* Top Drivers Rankings */}
        <div className="lg:col-span-1">
          <TopDrivers />
        </div>
      </div>

      {/* Recent rides table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Recent Rides</h2>
          <span className="text-xs text-text-secondary">{rides.length} latest</span>
        </div>
        {loading ? (
          <div className="p-6"><LoadingSkeleton height="44px" count={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-text-secondary">
                  {['#', 'Rider', 'Driver', 'Pickup', 'Drop', 'Fare', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-medium text-text-primary">{ride.ride_id}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{ride.rider_name}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{ride.driver_name}</td>
                    <td className="px-5 py-3.5 text-text-secondary truncate max-w-[120px]">{ride.pickup_location}</td>
                    <td className="px-5 py-3.5 text-text-secondary truncate max-w-[120px]">{ride.drop_location}</td>
                    <td className="px-5 py-3.5 font-semibold text-text-primary">₹{ride.fare}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                        {ride.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
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

export default AdminDashboard;
