import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiOutlineExclamationTriangle, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const EmergencySOS = ({ ride }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleTriggerSOS = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    
    // Get current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post('/sos/trigger', {
            ride_id: ride.ride_id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSosTriggered(true);
          setShowConfirm(false);
          toast.success('Emergency Contacts & Admins Notified!', { duration: 5000, icon: '🚨' });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to trigger SOS');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast.error('Failed to get location. Please enable location services.');
      }
    );
  };

  if (sosTriggered) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center animate-pulse">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h4 className="font-bold text-danger">SOS Alert Active</h4>
            <p className="text-xs text-text-secondary">Emergency contacts have been notified.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
      >
        <HiOutlineExclamationTriangle className="w-6 h-6" />
        EMERGENCY SOS
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-danger" />
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <HiXMark className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">Trigger SOS?</h3>
              <p className="text-sm text-text-secondary mb-6">
                This will instantly notify your emergency contacts with your live location and alert platform administrators.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-text-primary hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTriggerSOS}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-danger hover:bg-danger-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirm SOS'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencySOS;
