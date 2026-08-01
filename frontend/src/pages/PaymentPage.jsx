import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineArrowLeft } from 'react-icons/hi2';
import api from '../services/api';
import { getRideById } from '../services/rideService';
import PaymentCard from '../components/Cards/PaymentCard';
import InvoiceCard from '../components/Cards/InvoiceCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

// Initialize Stripe (use test key or env variable)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const PaymentPage = () => {
  const { rideId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(searchParams.get('status') || 'pending');

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await getRideById(rideId);
        setRide(data.ride);
        
        // If coming back from Stripe checkout with success
        if (searchParams.get('status') === 'success') {
          await handlePaymentSuccess(data.ride.fare, 'card');
        }
      } catch (err) {
        toast.error('Failed to load ride details');
        navigate('/rider/dashboard');
      }
      setLoading(false);
    };
    fetchRide();
  }, [rideId, navigate, searchParams]);

  const handlePaymentSuccess = async (amount, paymentMethod) => {
    try {
      await api.post('/payment/success', {
        ride_id: rideId,
        amount,
        method: paymentMethod
      });
      setStatus('success');
      toast.success('Payment completed successfully!');
    } catch (err) {
      toast.error('Error recording payment');
    }
  };

  const handlePay = async () => {
    if (!ride) return;
    setProcessing(true);

    try {
      if (method === 'card') {
        const { data } = await api.post('/payment/create-checkout-session', {
          ride_id: rideId,
          amount: ride.fare
        });
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        // Mock UPI/Cash direct success
        await new Promise(resolve => setTimeout(resolve, 1500));
        await handlePaymentSuccess(ride.fare, method);
      }
    } catch (err) {
      toast.error('Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton height="400px" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <InvoiceCard ride={ride} fare={ride.fare} />
        <button 
          onClick={() => navigate('/rider/dashboard')}
          className="btn-primary w-full mt-6 py-3.5"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <HiOutlineArrowLeft /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left side - Payment Options */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Checkout</h1>
            <p className="text-text-secondary">Select your preferred payment method</p>
          </div>

          <div className="space-y-4 mt-8">
            <PaymentCard 
              method="card" 
              selected={method === 'card'} 
              onClick={() => setMethod('card')} 
            />
            <PaymentCard 
              method="upi" 
              selected={method === 'upi'} 
              onClick={() => setMethod('upi')} 
            />
            <PaymentCard 
              method="cash" 
              selected={method === 'cash'} 
              onClick={() => setMethod('cash')} 
            />
          </div>
        </div>

        {/* Right side - Summary */}
        <div>
          <div className="sticky top-24">
            <InvoiceCard ride={ride} fare={ride?.fare} />
            
            <button
              onClick={handlePay}
              disabled={processing}
              className="btn-primary w-full mt-6 py-4 text-lg font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <HiOutlineLockClosed className="w-5 h-5" />
                  Pay ₹{ride?.fare}
                </>
              )}
            </button>
            <p className="text-center text-xs text-text-secondary mt-4 flex items-center justify-center gap-1">
              <HiOutlineLockClosed /> Payments are secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
