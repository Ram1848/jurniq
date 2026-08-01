import { useState, useEffect } from 'react';
import { HiOutlineBanknotes, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/payment/history?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setPayments(data.payments?.data || data.payments || []);
      if (data.payments?.totalPages) setTotalPages(data.payments.totalPages);
    } catch (err) {
      /* silent */
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <HiOutlineArrowLeft /> Back
      </button>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <HiOutlineBanknotes className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Payment History</h1>
            <p className="text-text-secondary text-sm">View all your past transactions</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search payments..."
            className="input-field w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton height="50px" count={5} />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineBanknotes className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No payments yet</h3>
            <p className="text-text-secondary mt-1">Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-text-secondary border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Ride Details</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(payment.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-text-primary line-clamp-1 max-w-[200px]" title={payment.pickup_location}>
                          {payment.pickup_location.split(',')[0]}
                        </span>
                        <span className="text-xs text-text-secondary line-clamp-1 max-w-[200px]" title={payment.drop_location}>
                          to {payment.drop_location.split(',')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-text-secondary">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        payment.payment_status === 'completed' ? 'bg-success/10 text-success' :
                        payment.payment_status === 'failed' ? 'bg-danger/10 text-danger' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {payment.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
};

export default PaymentHistory;
