import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineEnvelope, HiOutlineArrowLeft } from 'react-icons/hi2';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      toast.success(res.message || 'OTP sent to your email!');
      // Navigate to OTP verification page carrying the email address
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Account not found.';
      toast.error(errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-text-primary">
                Ride<span className="text-primary">Share</span>
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-text-primary text-center mb-1">Forgot Password?</h2>
          <p className="text-text-secondary text-center text-sm mb-8 leading-relaxed">
            Enter your registered email address below to receive a 6-digit OTP code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`input-field ${error ? '!border-danger' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                />
              </div>
              {error && <p className="text-danger text-xs mt-1.5 ml-1 font-medium">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base disabled:opacity-60 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors font-medium no-underline"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
