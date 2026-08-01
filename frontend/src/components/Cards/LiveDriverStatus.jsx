import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LiveDriverStatus = ({ initialStatus = 'offline' }) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;
    
    // Initial emit on connection
    if (status === 'online') {
      socket.emit('driverOnline', user.user_id);
    } else {
      socket.emit('driverOffline', user.user_id);
    }
  }, [socket, status, user.user_id]);

  const toggleStatus = async () => {
    if (!socket) {
      toast.error('Not connected to live server');
      return;
    }
    
    setLoading(true);
    try {
      const newStatus = status === 'online' ? 'offline' : 'online';
      
      if (newStatus === 'online') {
        socket.emit('driverOnline', user.user_id);
      } else {
        socket.emit('driverOffline', user.user_id);
      }
      
      setStatus(newStatus);
      toast.success(`You are now ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`relative w-4 h-4 rounded-full ${status === 'online' ? 'bg-success' : 'bg-gray-300'}`}>
          {status === 'online' && (
            <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Driver Status</h3>
          <p className="text-sm text-text-secondary capitalize">{status}</p>
        </div>
      </div>
      
      <button 
        onClick={toggleStatus} 
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
          status === 'online' 
            ? 'bg-red-50 text-danger hover:bg-red-100' 
            : 'bg-green-50 text-success hover:bg-green-100'
        }`}
      >
        Go {status === 'online' ? 'Offline' : 'Online'}
      </button>
    </div>
  );
};

export default LiveDriverStatus;
