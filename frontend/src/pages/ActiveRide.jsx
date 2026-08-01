import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import * as driverService from '../services/driverService';
import * as rideService from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';
import LiveTrackingMap from '../components/Map/LiveTrackingMap';
import EmergencySOS from '../components/Cards/EmergencySOS/EmergencySOS';

const statusConfig = {
  accepted: { label: 'Accepted — Ready to Start', color: 'text-blue-600 bg-blue-100', action: 'Start Ride', icon: HiOutlinePlayCircle, next: 'start' },
  in_progress: { label: 'In Progress', color: 'text-primary bg-primary/15', action: 'Complete Ride', icon: HiOutlineCheckCircle, next: 'complete' },
};

const ActiveRide = () => {
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRide = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'driver') {
        res = await driverService.getActiveRide();
      } else {
        res = await rideService.getActiveRide();
      }
      setRide(res.ride);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { 
    if (user) fetchRide(); 
  }, [user]);

  const handleAction = async () => {
    if (!ride) return;
    setActionLoading(true);
    try {
      if (ride.status === 'accepted') {
        await driverService.startRide(ride.ride_id);
        toast.success('Ride started!');
      } else if (ride.status === 'in_progress') {
        await driverService.completeRide(ride.ride_id);
        toast.success('Ride completed! 🎉');
      }
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Active Ride</h1>
        <div className="glass-card p-8">
          <LoadingSkeleton height="200px" />
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Active Ride</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <p className="text-5xl mb-4">🛣️</p>
          <p className="text-lg font-semibold text-text-primary mb-1">No active ride</p>
          <p className="text-text-secondary text-sm">Accept a ride request to get started.</p>
        </motion.div>
      </div>
    );
  }

  const config = statusConfig[ride.status];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Active Ride</h1>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Status banner */}
          <div className={`px-6 py-4 ${ride.status === 'in_progress' ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-semibold text-sm">{config?.label}</span>
              </div>
              <span className="text-white/80 text-xs font-medium">Ride #{ride.ride_id}</span>
            </div>
          </div>

          <div className="h-[300px] w-full border-b border-gray-100">
            <LiveTrackingMap 
              rideId={ride.ride_id} 
              pickup={ride.pickup_location} 
              drop={ride.drop_location} 
            />
          </div>

          <div className="p-6 space-y-6">
            {/* User details (Rider sees Driver, Driver sees Rider) */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                {user?.role === 'driver' ? 'Customer Details' : 'Driver Details'}
              </h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <HiOutlineUser className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">
                    {user?.role === 'driver' ? ride.rider_name : ride.driver_name}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <HiOutlinePhone className="w-3.5 h-3.5" />
                      {user?.role === 'driver' ? ride.rider_phone : ride.driver_phone}
                    </span>
                    {user?.role === 'driver' && ride.rider_email && (
                      <span className="flex items-center gap-1">
                        <HiOutlineEnvelope className="w-3.5 h-3.5" />{ride.rider_email}
                      </span>
                    )}
                    {user?.role === 'rider' && ride.vehicle_number && (
                      <span className="flex items-center gap-1 font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                        {ride.vehicle_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Route */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Route</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                  <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
                    <HiOutlineMapPin className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Pickup</p>
                    <p className="text-sm font-medium text-text-primary">{ride.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                  <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center flex-shrink-0">
                    <HiOutlineMapPin className="w-4 h-4 text-danger" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Drop-off</p>
                    <p className="text-sm font-medium text-text-primary">{ride.drop_location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ride info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Distance', value: `${ride.distance} km` },
                { label: 'Vehicle', value: ride.vehicle_type },
                { label: 'Fare', value: `₹${ride.fare}` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-surface text-center">
                  <p className="text-xs text-text-secondary">{label}</p>
                  <p className="text-sm font-bold text-text-primary capitalize">{value}</p>
                </div>
              ))}
            </div>

            {/* Action button (Only for Drivers) */}
            {user?.role === 'driver' && config && (
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all disabled:opacity-60 ${
                  ride.status === 'in_progress'
                    ? 'bg-gradient-to-r from-success to-emerald-500 hover:shadow-lg hover:shadow-success/30'
                    : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30'
                }`}
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <config.icon className="w-5 h-5" />
                    {config.action}
                  </span>
                )}
              </button>
            )}

            {/* Emergency SOS Button */}
            <div className="pt-4 border-t border-gray-100">
              <EmergencySOS ride={ride} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActiveRide;
