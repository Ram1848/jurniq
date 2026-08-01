import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiOutlineExclamationTriangle, HiOutlineCheckCircle, HiOutlineMapPin } from 'react-icons/hi2';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import LoadingSkeleton from '../../common/LoadingSkeleton/LoadingSkeleton';

const EmergencyDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/sos/alerts');
      setAlerts(res.data.alerts);
    } catch (err) {
      toast.error('Failed to load active emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Setup Socket.IO for real-time SOS alerts
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.on('sos_alert', (newAlert) => {
      // Show massive toast
      toast.error(`🚨 SOS ALERT: ${newAlert.rider_name} needs help!`, { duration: 10000 });
      // Play a sound (optional but helpful in a real dashboard)
      const audio = new Audio('/sos-beep.mp3'); // Assuming this exists or falls back silently
      audio.play().catch(e => {}); 
      
      // Add to top of list
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.put(`/sos/resolve/${id}`);
      setAlerts(alerts.filter(a => a.event_id !== id));
      toast.success('Emergency resolved successfully');
    } catch (err) {
      toast.error('Failed to resolve emergency');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton height="200px" />;
  }

  return (
    <div className="glass-card overflow-hidden border border-danger/20">
      <div className="p-6 bg-danger/5 border-b border-danger/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center animate-pulse">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-danger flex items-center gap-2">
              Active SOS Alerts
            </h2>
            <p className="text-sm text-danger/80">Immediate attention required</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-danger text-white rounded-full text-sm font-bold shadow-lg shadow-danger/30">
          {alerts.length} Active
        </div>
      </div>

      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg font-semibold text-text-primary">All Clear</p>
            <p className="text-text-secondary text-sm">There are no active emergency alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {alerts.map(alert => (
                <motion.div 
                  key={alert.event_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-danger/30 p-5 rounded-2xl shadow-sm relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger animate-pulse" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-1">Rider</p>
                        <p className="text-sm font-bold text-text-primary">{alert.rider_name}</p>
                        <p className="text-xs text-text-secondary">{alert.rider_phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-1">Driver</p>
                        <p className="text-sm font-bold text-text-primary">{alert.driver_name || 'N/A'}</p>
                        <p className="text-xs text-text-secondary">{alert.driver_phone || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-1">Location</p>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <HiOutlineMapPin className="w-4 h-4" /> View Map
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-1">Time</p>
                        <p className="text-sm font-medium text-text-primary">
                          {new Date(alert.created_at || alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolve(alert.event_id)}
                      disabled={resolvingId === alert.event_id}
                      className="whitespace-nowrap px-6 py-3 bg-danger hover:bg-danger-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {resolvingId === alert.event_id ? 'Resolving...' : 'Resolve SOS'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDashboard;
