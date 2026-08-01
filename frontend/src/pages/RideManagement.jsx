import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineXCircle } from 'react-icons/hi2';
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

const filters = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
const ITEMS_PER_PAGE = 10;

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);

  const fetchRides = async () => {
    setLoading(true);
    try { 
      const res = await adminService.getAllRides(page, ITEMS_PER_PAGE, search); 
      setRides(res.rides.data || res.rides); 
      if (res.rides.totalPages) setTotalPages(res.rides.totalPages);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchRides(); 
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this ride?')) return;
    setCancelling(id);
    try { await adminService.cancelRide(id); toast.success('Ride cancelled'); fetchRides(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setCancelling(null);
  };

  const filtered = rides
    .filter((r) => filter === 'all' || r.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Ride Management</h1>
      <p className="text-text-secondary text-sm mb-6">Monitor and manage all rides</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text-secondary hover:bg-gray-100'
              }`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search rides..." className="input-field !pl-10 !py-2.5" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="60px" count={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🛣️</p>
          <p className="text-lg font-semibold text-text-primary">No rides found</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text-secondary">
                    {['#', 'Rider', 'Driver', 'Pickup', 'Drop', 'Fare', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ride) => (
                    <motion.tr key={ride.ride_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{ride.ride_id}</td>
                      <td className="px-4 py-3 text-text-secondary">{ride.rider_name}</td>
                      <td className="px-4 py-3 text-text-secondary">{ride.driver_name}</td>
                      <td className="px-4 py-3 text-text-secondary truncate max-w-[110px]">{ride.pickup_location}</td>
                      <td className="px-4 py-3 text-text-secondary truncate max-w-[110px]">{ride.drop_location}</td>
                      <td className="px-4 py-3 font-semibold text-text-primary">₹{ride.fare}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                          {ride.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{new Date(ride.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                          <button onClick={() => handleCancel(ride.ride_id)} disabled={cancelling === ride.ride_id}
                            className="text-danger hover:text-red-700 text-xs font-medium flex items-center gap-1">
                            <HiOutlineXCircle className="w-4 h-4" /> Cancel
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40">Previous</button>
              <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RideManagement;
