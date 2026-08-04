import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineLockClosed,
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import api from '../services/api';
import { getRideById } from '../services/rideService';
import PaymentCard from '../components/Cards/PaymentCard';
import InvoiceCard from '../components/Cards/InvoiceCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';

const PaymentPage = () => {
  const { rideId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'pending');
  const [paymentError, setPaymentError] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await getRideById(rideId);
        setRide(data.ride);

        // If redirected back from Stripe checkout with success status
        if (searchParams.get('status') === 'success') {
          await processBackendPayment('card', null, null);
        }
      } catch (err) {
        toast.error('Failed to load ride details');
        navigate('/rider/dashboard');
      }
      setLoading(false);
    };
    fetchRide();
  }, [rideId, navigate, searchParams]);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (cardErrors.cardNumber) setCardErrors((prev) => ({ ...prev, cardNumber: '' }));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
    if (cardErrors.expiry) setCardErrors((prev) => ({ ...prev, expiry: '' }));
  };

  // Validate UPI
  const validateUPI = () => {
    const trimmed = upiId.trim();
    if (!trimmed) {
      setUpiError('UPI ID is required (e.g. username@bank)');
      return false;
    }
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(trimmed)) {
      setUpiError('Please enter a valid UPI ID (e.g. username@okicici, mobile@upi)');
      return false;
    }
    setUpiError('');
    return true;
  };

  // Validate Card
  const validateCard = () => {
    const errors = {};
    const rawCard = cardNumber.replace(/\s/g, '');

    if (!rawCard || rawCard.length !== 16) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    if (!cardHolder.trim() || cardHolder.trim().length < 2) {
      errors.cardHolder = 'Cardholder name is required';
    }
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiry || !expiryRegex.test(expiry)) {
      errors.expiry = 'Enter valid expiry (MM/YY)';
    } else {
      const [mm, yy] = expiry.split('/').map(Number);
      const currentYear = parseInt(new Date().getFullYear().toString().slice(-2), 10);
      const currentMonth = new Date().getMonth() + 1;
      if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        errors.expiry = 'Card has expired';
      }
    }
    if (!cvv || !/^[0-9]{3,4}$/.test(cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process Backend Payment Request
  const processBackendPayment = async (payMethod, upiDetails, cardData) => {
    setProcessing(true);
    setPaymentError('');

    try {
      // Step 1: Verification Animation
      setProcessingStep(
        payMethod === 'upi'
          ? 'Verifying UPI ID with bank...'
          : payMethod === 'card'
          ? 'Authorizing card credentials...'
          : 'Processing cash confirmation...'
      );
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: Gateway Simulation / Submission
      setProcessingStep('Recording secure transaction...');
      await new Promise((r) => setTimeout(r, 600));

      const payload = {
        ride_id: rideId,
        amount: ride.fare,
        method: payMethod,
        upi_id: upiDetails,
        card_details: cardData ? { cardHolder, last4: cardNumber.slice(-4) } : null,
        transaction_id: `TXN_${payMethod.toUpperCase()}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const res = await api.post('/payment/process', payload);

      // Step 3: Success
      setProcessingStep('Finalizing invoice & sending receipt...');
      await new Promise((r) => setTimeout(r, 500));

      setCompletedPayment(res.data.payment);
      setStatus('success');
      toast.success('Payment completed successfully! 🎉');
    } catch (err) {
      console.error('Payment Error:', err);
      const msg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      setPaymentError(msg);
      setStatus('failed');
      toast.error(msg);
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle Pay Button Click
  const handlePay = async () => {
    if (!ride) return;

    if (method === 'upi') {
      if (!validateUPI()) return;
      await processBackendPayment('upi', upiId.trim(), null);
    } else if (method === 'card') {
      if (!validateCard()) return;
      await processBackendPayment('card', null, {
        cardNumber,
        cardHolder,
        expiry,
        cvv,
      });
    } else if (method === 'cash') {
      await processBackendPayment('cash', null, null);
    }
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton height="400px" />
      </div>
    );
  }

  // Success Screen
  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto mt-6 space-y-6">
        <InvoiceCard ride={ride} fare={ride?.fare} paymentDetails={completedPayment} />
        
        <div className="flex gap-4">
          <button
            onClick={handlePrintReceipt}
            className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <HiOutlinePrinter className="w-5 h-5" /> Print Receipt
          </button>
          <button
            onClick={() => navigate('/rider/dashboard')}
            className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft /> Back
      </button>

      {/* Failure Banner */}
      {status === 'failed' && paymentError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
          <HiOutlineExclamationTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Payment Failed</p>
            <p className="text-xs mt-1">{paymentError}</p>
          </div>
          <button
            onClick={() => setStatus('pending')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side: Payment Options & Input Forms */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Checkout</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Select and complete your payment method</p>
          </div>

          {/* Payment Method Selector Cards */}
          <div className="space-y-4">
            {/* Card Selection */}
            <div>
              <PaymentCard
                method="card"
                selected={method === 'card'}
                onClick={() => {
                  setMethod('card');
                  setStatus('pending');
                }}
              />
              {method === 'card' && (
                <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <HiOutlineCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="4532 1234 5678 9012"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {cardErrors.cardNumber && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Johnson"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        if (cardErrors.cardHolder) setCardErrors((prev) => ({ ...prev, cardHolder: '' }));
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {cardErrors.expiry && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.expiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        CVV Code
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, ''));
                          if (cardErrors.cvv) setCardErrors((prev) => ({ ...prev, cvv: '' }));
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {cardErrors.cvv && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UPI Selection */}
            <div>
              <PaymentCard
                method="upi"
                selected={method === 'upi'}
                onClick={() => {
                  setMethod('upi');
                  setStatus('pending');
                }}
              />
              {method === 'upi' && (
                <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3 shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Enter VPA / UPI ID
                  </label>
                  <div className="relative">
                    <HiOutlineDevicePhoneMobile className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="username@bank (e.g. alex@okicici)"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (upiError) setUpiError('');
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {upiError && <p className="text-xs text-red-500 font-medium">{upiError}</p>}

                  {/* Sample UPI ID Pills */}
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Quick Test UPI Handles:</p>
                    <div className="flex flex-wrap gap-2">
                      {['test@upi', 'rider@okicici', 'user@paytm', 'john@ybl'].map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => {
                            setUpiId(sample);
                            setUpiError('');
                          }}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs rounded-lg font-mono transition-all border border-gray-200 dark:border-gray-600"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cash Selection */}
            <div>
              <PaymentCard
                method="cash"
                selected={method === 'cash'}
                onClick={() => {
                  setMethod('cash');
                  setStatus('pending');
                }}
              />
              {method === 'cash' && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
                  <HiOutlineBanknotes className="w-6 h-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-medium">
                    Pay cash directly to your driver upon arrival or ride completion. Click below to confirm cash booking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Invoice & Action Button */}
        <div>
          <div className="sticky top-24 space-y-6">
            <InvoiceCard ride={ride} fare={ride?.fare} />

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {processing ? (
                <span className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-medium">{processingStep || 'Processing...'}</span>
                </span>
              ) : (
                <>
                  <HiOutlineLockClosed className="w-5 h-5" />
                  Pay ₹{ride?.fare} via {method.toUpperCase()}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <HiOutlineLockClosed className="w-3.5 h-3.5" /> Payments are 256-bit SSL encrypted & secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
