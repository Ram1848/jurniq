import { useState } from 'react';
import { motion } from 'motion/react';
import {
  HiOutlineDocumentArrowDown,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import * as adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const Reports = () => {
  const [type, setType] = useState('daily');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (t) => {
    setType(t);
    setLoading(true);
    try {
      const res = await adminService.getReports(t);
      setReport(res.report);
    } catch (err) {
      toast.error('Failed to load report');
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!report?.rides?.length) { toast.error('No data to download'); return; }
    const headers = ['Ride ID', 'Rider', 'Driver', 'Pickup', 'Drop', 'Distance', 'Fare', 'Status', 'Vehicle', 'Payment', 'Date'];
    const rows = report.rides.map((r) => [
      r.ride_id, r.rider_name, r.driver_name, `"${r.pickup_location}"`, `"${r.drop_location}"`,
      r.distance, r.fare, r.status, r.vehicle_type, r.payment_method, new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jurniq_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Reports</h1>
      <p className="text-text-secondary text-sm mb-8">Generate and download ride reports</p>

      {/* Report type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { key: 'daily', label: 'Daily Report', desc: "Today's rides", gradient: 'from-primary to-blue-400' },
          { key: 'weekly', label: 'Weekly Report', desc: 'This week', gradient: 'from-emerald-500 to-green-400' },
          { key: 'monthly', label: 'Monthly Report', desc: 'This month', gradient: 'from-accent to-purple-400' },
        ].map((r) => (
          <motion.button
            key={r.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchReport(r.key)}
            className={`p-6 rounded-2xl text-left transition-all border-2 ${
              type === r.key && report ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent'
            } bg-gradient-to-br ${r.gradient} text-white relative overflow-hidden`}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <HiOutlineCalendarDays className="w-7 h-7 mb-3 text-white/80" />
              <p className="font-bold text-base">{r.label}</p>
              <p className="text-white/70 text-xs mt-1">{r.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Report results */}
      {loading ? (
        <div className="glass-card p-6"><LoadingSkeleton height="200px" /></div>
      ) : report ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: HiOutlineMapPin, label: 'Total Rides', value: report.totalRides, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: HiOutlineBanknotes, label: 'Revenue', value: `₹${report.totalRevenue}`, color: 'text-success', bg: 'bg-success/10' },
              { icon: HiOutlineCheckCircle, label: 'Completed', value: report.completedCount, color: 'text-accent', bg: 'bg-accent/10' },
              { icon: HiOutlineXCircle, label: 'Cancelled', value: report.cancelledCount, color: 'text-danger', bg: 'bg-danger/10' },
            ].map((c) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <p className="text-2xl font-bold text-text-primary">{c.value}</p>
                <p className="text-xs text-text-secondary mt-1">{c.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Download button */}
          <div className="flex justify-end mb-4">
            <button onClick={downloadCSV} className="btn-primary text-sm !py-2.5 !px-6">
              <HiOutlineDocumentArrowDown className="w-4 h-4" /> Download CSV
            </button>
          </div>

          {/* Rides table */}
          {report.rides.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text-secondary">
                      {['#', 'Rider', 'Driver', 'Pickup', 'Drop', 'Fare', 'Status', 'Date'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rides.map((r) => (
                      <tr key={r.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-text-primary">{r.ride_id}</td>
                        <td className="px-4 py-3 text-text-secondary">{r.rider_name}</td>
                        <td className="px-4 py-3 text-text-secondary">{r.driver_name}</td>
                        <td className="px-4 py-3 text-text-secondary truncate max-w-[100px]">{r.pickup_location}</td>
                        <td className="px-4 py-3 text-text-secondary truncate max-w-[100px]">{r.drop_location}</td>
                        <td className="px-4 py-3 font-semibold text-text-primary">₹{r.fare}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[r.status] || ''}`}>
                            {r.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-text-secondary">No rides for this period</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-semibold text-text-primary mb-1">Select a report type</p>
          <p className="text-text-secondary text-sm">Click one of the cards above to generate a report.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
