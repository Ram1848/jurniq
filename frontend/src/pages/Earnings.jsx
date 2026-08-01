import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineRocketLaunch,
} from 'react-icons/hi2';
import * as driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

const Earnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await driverService.getEarnings();
        setData(res.earnings);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const earningCards = [
    { label: "Today's Earnings", key: 'todayEarnings', icon: HiOutlineBanknotes, gradient: 'from-emerald-500 to-green-400' },
    { label: 'Weekly Earnings', key: 'weeklyEarnings', icon: HiOutlineCalendarDays, gradient: 'from-primary to-blue-400' },
    { label: 'Monthly Earnings', key: 'monthlyEarnings', icon: HiOutlineChartBar, gradient: 'from-accent to-purple-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Earnings</h1>
      <p className="text-text-secondary text-sm mb-8">Track your income and performance</p>

      {/* Earning cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {earningCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white relative overflow-hidden`}
          >
            {/* Decorative blob */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <card.icon className="w-8 h-8 mb-3 text-white/80" />
              <p className="text-white/80 text-sm mb-1">{card.label}</p>
              {loading ? (
                <div className="h-10 w-28 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                <p className="text-3xl font-extrabold">₹{data?.[card.key] ?? 0}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total earnings card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-6">Earnings Summary</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HiOutlineBanknotes className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-text-primary">Total Earnings</span>
              </div>
              {loading ? (
                <LoadingSkeleton width="80px" height="24px" />
              ) : (
                <span className="text-xl font-bold text-primary">₹{data?.totalEarnings ?? 0}</span>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <HiOutlineRocketLaunch className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm font-medium text-text-primary">Total Trips</span>
              </div>
              {loading ? (
                <LoadingSkeleton width="50px" height="24px" />
              ) : (
                <span className="text-xl font-bold text-success">{data?.totalTrips ?? 0}</span>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <HiOutlineStar className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm font-medium text-text-primary">Average Rating</span>
              </div>
              {loading ? (
                <LoadingSkeleton width="50px" height="24px" />
              ) : (
                <span className="text-xl font-bold text-warning">
                  {data?.avgRating > 0 ? `${data.avgRating} ⭐` : 'N/A'}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Performance chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-6">Performance Overview</h3>

          {loading ? (
            <LoadingSkeleton height="160px" />
          ) : (
            <div className="space-y-4">
              {/* Visual bar chart */}
              {[
                { label: 'Today', value: data?.todayEarnings ?? 0, max: Math.max(data?.monthlyEarnings || 1, 1), color: 'bg-success' },
                { label: 'This Week', value: data?.weeklyEarnings ?? 0, max: Math.max(data?.monthlyEarnings || 1, 1), color: 'bg-primary' },
                { label: 'This Month', value: data?.monthlyEarnings ?? 0, max: Math.max(data?.monthlyEarnings || 1, 1), color: 'bg-accent' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-semibold text-text-primary">₹{value}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </div>
              ))}

              {/* Per trip average */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 text-center">
                <p className="text-xs text-text-secondary mb-1">Average Per Trip</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{data?.totalTrips > 0 ? (data.totalEarnings / data.totalTrips).toFixed(0) : 0}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Earnings;
