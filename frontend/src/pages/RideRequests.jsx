import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import * as driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const RideRequests = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await driverService.getRideRequests();
      setRides(res.rides);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchRides(); }, []);

  const handleAccept = async (rideId) => {
    setActionLoading(rideId);
    try {
      await driverService.acceptRide(rideId);
      toast.success('Ride accepted!');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept ride');
    }
    setActionLoading(null);
  };

  const handleReject = (rideId) => {
    // Just remove from local state (no backend reject endpoint needed)
    setRides((prev) => prev.filter((r) => r.ride_id !== rideId));
    toast('Ride request dismissed', { icon: '👋' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ride Requests</h1>
          <p className="text-text-secondary text-sm mt-1">Accept pending rides from riders</p>
        </div>
        <button onClick={fetchRides} className="btn-secondary text-sm !py-2 !px-5">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6">
              <LoadingSkeleton height="140px" />
            </div>
          ))}
        </div>
      ) : rides.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-semibold text-text-primary mb-1">No pending requests</p>
          <p className="text-text-secondary text-sm">New ride requests will appear here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {rides.map((ride) => (
              <motion.div
                key={ride.ride_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2.5 py-1 rounded-full">
                    Ride #{ride.ride_id}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-medium">
                    Pending
                  </span>
                </div>

                {/* Rider info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <HiOutlineUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{ride.rider_name}</p>
                    <p className="text-xs text-text-secondary">{ride.rider_phone}</p>
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <HiOutlineMapPin className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-primary">{ride.pickup_location}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <HiOutlineMapPin className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-primary">{ride.drop_location}</p>
                  </div>
                </div>

                {/* Details row */}
                <div className="flex items-center justify-between text-sm mb-5 p-3 bg-surface rounded-xl">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <HiOutlineTruck className="w-4 h-4" />
                    <span className="capitalize">{ride.vehicle_type}</span>
                  </div>
                  <span className="text-text-secondary">{ride.distance} km</span>
                  <span className="text-lg font-bold text-primary">₹{ride.fare}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(ride.ride_id)}
                    disabled={actionLoading === ride.ride_id}
                    className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-60"
                  >
                    {actionLoading === ride.ride_id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Accepting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <HiOutlineCheckCircle className="w-4 h-4" /> Accept
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(ride.ride_id)}
                    className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-text-secondary text-sm font-semibold hover:border-danger hover:text-danger transition-all"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <HiOutlineXCircle className="w-4 h-4" /> Reject
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RideRequests;
