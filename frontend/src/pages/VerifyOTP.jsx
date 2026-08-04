import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineArrowPath } from 'react-icons/hi2';
import { verifyOTP, resendOTP } from '../services/authService';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  // 5 Minutes Countdown Timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    // Auto-advance to next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (timeLeft <= 0) {
      toast.error('OTP Expired. Please click "Resend OTP".');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email, fullOtp);
      toast.success(res.message || 'OTP verified successfully!');
      // Navigate to Reset Password page with email & verified OTP
      navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(fullOtp)}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid OTP';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is missing');
      return;
    }

    setResending(true);
    try {
      const res = await resendOTP(email);
      toast.success(res.message || 'New OTP sent to your email.');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeLeft(300); // Reset 5-minute timer
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-blue-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 sm:p-10 shadow-xl shadow-black/5">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <HiOutlineShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-primary text-center mb-1">Verify OTP Code</h2>
          <p className="text-text-secondary text-center text-sm mb-2">
            We have sent a 6-digit OTP code to
          </p>
          <p className="text-primary font-semibold text-center text-sm mb-8 break-all">
            {email || 'your email'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 Segmented OTP Inputs */}
            <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {/* Timer & Resend Option */}
            <div className="flex items-center justify-between text-sm bg-slate-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-text-secondary font-medium">
                {timeLeft > 0 ? (
                  <span>OTP expires in <strong className="text-primary font-mono font-bold">{formatTime(timeLeft)}</strong></span>
                ) : (
                  <span className="text-danger font-semibold">OTP Expired</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold transition-colors disabled:opacity-50"
              >
                <HiOutlineArrowPath className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6}
              className="btn-primary w-full !py-3.5 text-base disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors font-medium no-underline"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Change Email
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
