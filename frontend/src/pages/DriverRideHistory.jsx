import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import * as driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

const statusColors = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-primary/15 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const filters = ['all', 'completed', 'cancelled'];
const ITEMS_PER_PAGE = 8;

const DriverRideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await driverService.getRideHistory(page, ITEMS_PER_PAGE);
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

  const filtered = rides
    .filter((r) => filter === 'all' || r.status === filter)
    .filter(
      (r) =>
        !search ||
        r.pickup_location?.toLowerCase().includes(search.toLowerCase()) ||
        r.drop_location?.toLowerCase().includes(search.toLowerCase()) ||
        r.rider_name?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search by rider or location..."
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
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-semibold text-text-primary mb-1">No rides found</p>
          <p className="text-text-secondary text-sm">Try adjusting your filters or search.</p>
        </div>
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="hidden md:block glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text-secondary">
                    {['#', 'Rider', 'Pickup', 'Drop', 'Vehicle', 'Distance', 'Fare', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ride) => (
                    <tr key={ride.ride_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{ride.ride_id}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{ride.rider_name}</td>
                      <td className="px-5 py-3.5 text-text-secondary truncate max-w-[120px]">{ride.pickup_location}</td>
                      <td className="px-5 py-3.5 text-text-secondary truncate max-w-[120px]">{ride.drop_location}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((ride) => (
              <motion.div key={ride.ride_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-text-secondary">#{ride.ride_id}</span>
                    <p className="text-sm font-semibold text-text-primary">{ride.rider_name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ride.status] || ''}`}>
                    {ride.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{ride.pickup_location} → {ride.drop_location}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-text-secondary capitalize">{ride.vehicle_type} · {ride.distance} km</span>
                  <span className="font-bold text-primary">₹{ride.fare}</span>
                </div>
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
              <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
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

export default DriverRideHistory;
