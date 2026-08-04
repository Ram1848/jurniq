import { HiOutlineCalendarDays, HiOutlineCheckBadge, HiOutlineHashtag, HiOutlineCreditCard } from 'react-icons/hi2';

const InvoiceCard = ({ ride, fare, paymentDetails }) => {
  if (!ride) return null;

  const method = paymentDetails?.payment_method || ride?.payment_method || 'cash';
  const txnId = paymentDetails?.transaction_id || paymentDetails?.stripe_transaction_id;

  return (
    <div className="glass-card overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <HiOutlineCheckBadge className="w-12 h-12 text-emerald-400 mx-auto mb-3 relative z-10 animate-bounce" />
        <h2 className="text-xl font-bold relative z-10">Ride Payment Receipt</h2>
        <p className="text-4xl font-bold mt-2 relative z-10 text-white">₹{fare}</p>
        {txnId && (
          <span className="inline-block mt-3 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-mono text-indigo-200">
            ID: {txnId}
          </span>
        )}
      </div>

      <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Trip Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ride.pickup_location}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Drop-off</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ride.drop_location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <HiOutlineCalendarDays className="w-4 h-4" /> Date
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {new Date(ride.created_at || Date.now()).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <HiOutlineCreditCard className="w-4 h-4" /> Payment Method
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
              {method}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Base Fare</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">₹{(fare * 0.85).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Platform Fee & Taxes</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">₹{(fare * 0.15).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span>Total Paid</span>
            <span className="text-indigo-600 dark:text-indigo-400">₹{fare}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
