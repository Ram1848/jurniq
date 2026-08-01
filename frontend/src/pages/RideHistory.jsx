import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineXCircle } from 'react-icons/hi2';
import * as rideService from '../services/rideService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const filters = ['all', 'pending', 'completed', 'cancelled'];
const ITEMS_PER_PAGE = 6;

const RideHistory = () => {
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
      const res = await rideService.getHistory(page, ITEMS_PER_PAGE);
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

  const handleCancel = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    setCancelling(rideId);
    try {
      await rideService.cancelRide(rideId);
      toast.success('Ride cancelled');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
    setCancelling(null);
  };

  // Filter and search
  const filtered = rides
    .filter((r) => filter === 'all' || r.status === filter)
    .filter(
      (r) =>
        !search ||
        r.pickup_location?.toLowerCase().includes(search.toLowerCase()) ||
        r.drop_location?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Ride History</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location..."
            className="input-field !pl-10 !py-2.5"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton height="80px" count={4} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🚗</p>
          <p className="text-lg font-semibold text-text-primary mb-1">No rides found</p>
          <p className="text-text-secondary text-sm">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text-secondary">
                    {['#', 'Pickup', 'Drop', 'Vehicle', 'Distance', 'Fare', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ride) => (
                    <tr key={ride.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{ride.ride_id}</td>
                      <td className="px-5 py-3.5 text-text-secondary truncate max-w-[130px]">{ride.pickup_location}</td>
                      <td className="px-5 py-3.5 text-text-secondary truncate max-w-[130px]">{ride.drop_location}</td>
                      <td className="px-5 py-3.5 capitalize text-text-secondary">{ride.vehicle_type}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{ride.distance} km</td>
                      <td className="px-5 py-3.5 font-semibold text-text-primary">₹{ride.fare}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                          {ride.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                        {new Date(ride.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {ride.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(ride.ride_id)}
                            disabled={cancelling === ride.ride_id}
                            className="text-danger hover:text-red-700 text-xs font-medium flex items-center gap-1"
                          >
                            <HiOutlineXCircle className="w-4 h-4" /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((ride) => (
              <motion.div
                key={ride.ride_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-text-secondary">Ride #{ride.ride_id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                    {ride.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-text-primary font-medium">{ride.pickup_location}</p>
                <p className="text-xs text-text-secondary mb-2">→ {ride.drop_location}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{ride.distance} km · {ride.vehicle_type}</span>
                  <span className="font-bold text-primary">₹{ride.fare}</span>
                </div>
                {ride.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(ride.ride_id)}
                    className="mt-3 text-xs text-danger font-medium flex items-center gap-1"
                  >
                    <HiOutlineXCircle className="w-4 h-4" /> Cancel Ride
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RideHistory;
