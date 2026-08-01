import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineStar, HiOutlineTrophy } from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import * as adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

const statusColors = {
  pending: { color: '#FF9F0A', label: 'Pending' },
  accepted: { color: '#0A84FF', label: 'Accepted' },
  in_progress: { color: '#5E5CE6', label: 'In Progress' },
  completed: { color: '#30D158', label: 'Completed' },
  cancelled: { color: '#FF453A', label: 'Cancelled' },
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getAnalytics();
        setData(res.analytics);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="glass-card p-6"><LoadingSkeleton height="200px" /></div>)}
        </div>
      </div>
    );
  }

  const totalStatusCount = data?.statusDistribution?.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Analytics</h1>
      <p className="text-text-secondary text-sm mb-8">Platform insights and performance metrics</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Rides Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">Daily Rides (Last 7 Days)</h3>
          <div className="h-64">
            {(data?.dailyRides || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyRides.map(d => ({ ...d, label: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">No data yet</div>
            )}
          </div>
        </motion.div>

        {/* Ride Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">Ride Status Distribution</h3>
          <div className="h-64 flex flex-col sm:flex-row items-center">
            {(data?.statusDistribution || []).length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {data.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.status]?.color || '#999'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col justify-center gap-3 pl-0 sm:pl-6 mt-4 sm:mt-0">
                  {data.statusDistribution.map((s) => {
                    const cfg = statusColors[s.status] || { color: '#999', label: s.status };
                    const pct = ((s.count / totalStatusCount) * 100).toFixed(1);
                    return (
                      <div key={s.status} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span className="text-text-secondary capitalize">{cfg.label}</span>
                        </div>
                        <span className="font-semibold text-text-primary">{s.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">No data yet</div>
            )}
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">Revenue Trend (Last 6 Months)</h3>
          <div className="h-64">
            {(data?.revenueTrend || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend.map(m => ({ ...m, label: m.month?.slice(5) }))}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5E5CE6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5E5CE6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `₹${val}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#5E5CE6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">No data yet</div>
            )}
          </div>
        </motion.div>

        {/* Monthly Rides */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">Monthly Rides (Last 6 Months)</h3>
          <div className="h-64">
            {(data?.monthlyRides || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyRides.map(m => ({ ...m, label: m.month?.slice(5) }))}>
                  <defs>
                    <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#30D158" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#30D158" strokeWidth={3} fillOpacity={1} fill="url(#colorRides)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">No data yet</div>
            )}
          </div>
        </motion.div>

        {/* Top Drivers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><HiOutlineTrophy className="w-4 h-4 text-warning" /> Top Drivers</h3>
          {(data?.topDrivers || []).length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topDrivers.map((d, i) => (
                <div key={d.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    'bg-gradient-to-br from-orange-300 to-orange-400'
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{d.full_name}</p>
                    <p className="text-xs text-text-secondary">{d.total_rides} rides · ₹{parseFloat(d.total_earnings).toFixed(0)}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-warning">
                    <HiOutlineStar className="w-4 h-4" /> {parseFloat(d.avg_rating).toFixed(1) > 0 ? parseFloat(d.avg_rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Most Active Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Most Active Riders</h3>
          {(data?.activeUsers || []).length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.activeUsers.map((u, i) => (
                <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{u.full_name}</p>
                    <p className="text-xs text-text-secondary">{u.total_rides} rides</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">₹{parseFloat(u.total_spent).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
