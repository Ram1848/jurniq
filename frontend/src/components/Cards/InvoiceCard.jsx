import { HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineCheckBadge } from 'react-icons/hi2';

const InvoiceCard = ({ ride, fare }) => {
  if (!ride) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <HiOutlineCheckBadge className="w-12 h-12 text-success mx-auto mb-3 relative z-10" />
        <h2 className="text-xl font-bold relative z-10">Ride Total</h2>
        <p className="text-4xl font-bold mt-2 relative z-10 text-white">₹{fare}</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Trip Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 bg-success rounded-full" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Pickup</p>
                <p className="text-sm font-medium text-text-primary">{ride.pickup_location}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 bg-danger rounded-sm" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Drop-off</p>
                <p className="text-sm font-medium text-text-primary">{ride.drop_location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-text-secondary flex items-center gap-1">
              <HiOutlineCalendarDays className="w-4 h-4" /> Date
            </span>
            <span className="font-medium text-text-primary">
              {new Date(ride.created_at || Date.now()).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-text-secondary">Base Fare</span>
            <span className="font-medium text-text-primary">₹{(fare * 0.7).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-text-secondary">Taxes & Fees</span>
            <span className="font-medium text-text-primary">₹{(fare * 0.3).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-text-primary pt-2 border-t border-gray-100 mt-2">
            <span>Total</span>
            <span>₹{fare}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
