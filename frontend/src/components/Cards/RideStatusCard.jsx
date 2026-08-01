import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineMapPin, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2';

const statusConfig = {
  pending: { label: 'Finding Driver', color: 'text-warning', bg: 'bg-warning/10', icon: HiOutlineClock, message: 'Looking for nearby drivers...' },
  accepted: { label: 'Driver Assigned', color: 'text-primary', bg: 'bg-primary/10', icon: HiOutlineCheckCircle, message: 'Driver is on the way to your pickup location.' },
  in_progress: { label: 'Ride Started', color: 'text-blue-500', bg: 'bg-blue-100', icon: HiOutlineMapPin, message: 'You are on your way to the destination.' },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10', icon: HiOutlineCheckCircle, message: 'You have arrived at your destination.' },
  cancelled: { label: 'Cancelled', color: 'text-danger', bg: 'bg-danger/10', icon: HiOutlineXCircle, message: 'This ride has been cancelled.' }
};

const RideStatusCard = ({ rideId, initialStatus = 'pending' }) => {
  const [status, setStatus] = useState(initialStatus);
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit('join_ride_room', rideId);

    const handleStatusChange = (newStatus) => (data) => {
      if (data.rideId === rideId) {
        setStatus(newStatus);
      }
    };

    socket.on('rideAccepted', handleStatusChange('accepted'));
    socket.on('rideStarted', handleStatusChange('in_progress'));
    socket.on('rideCompleted', handleStatusChange('completed'));
    socket.on('rideCancelled', handleStatusChange('cancelled'));

    return () => {
      socket.off('rideAccepted');
      socket.off('rideStarted');
      socket.off('rideCompleted');
      socket.off('rideCancelled');
    };
  }, [socket, rideId]);

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-text-primary text-lg">{config.label}</h3>
            {status === 'pending' && (
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-warning animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-warning animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-warning animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
          <p className="text-text-secondary text-sm">{config.message}</p>
        </div>
      </div>
      
      {/* Progress Bar Visualizer */}
      <div className="mt-6">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
          <div className={`h-full transition-all duration-1000 ${
            status === 'pending' ? 'w-1/4 bg-warning' :
            status === 'accepted' ? 'w-2/4 bg-primary' :
            status === 'in_progress' ? 'w-3/4 bg-blue-500' :
            status === 'completed' ? 'w-full bg-success' : 'w-full bg-danger'
          }`} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2">
          <span className={status !== 'pending' ? 'text-primary' : ''}>Request</span>
          <span className={status === 'accepted' || status === 'in_progress' || status === 'completed' ? 'text-primary' : ''}>Assigned</span>
          <span className={status === 'in_progress' || status === 'completed' ? 'text-primary' : ''}>Transit</span>
          <span className={status === 'completed' ? 'text-success' : status === 'cancelled' ? 'text-danger' : ''}>
            {status === 'cancelled' ? 'Cancelled' : 'Drop'}
          </span>
        </div>
      </div>

      {status === 'completed' && (
        <button 
          onClick={() => navigate(`/payment/${rideId}`)}
          className="btn-primary w-full mt-6 py-3"
        >
          Pay Now
        </button>
      )}
    </div>
  );
};

export default RideStatusCard;
