import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiCheck, HiXMark } from 'react-icons/hi2';
import { resetPassword } from '../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password criteria checking
  const criteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const validCount = Object.values(criteria).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: '', color: 'bg-gray-200', text: '' };
    if (validCount <= 2) return { label: 'Weak', color: 'bg-danger', text: 'text-danger' };
    if (validCount <= 4) return { label: 'Medium', color: 'bg-warning', text: 'text-warning' };
    return { label: 'Strong', color: 'bg-success', text: 'text-success' };
  };

  const strength = getStrengthLabel();

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return false;
    }
    if (validCount < 5) {
      setError('Please fulfill all password security criteria');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
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
      const res = await resetPassword(email, otp, newPassword, confirmPassword);
      toast.success(res.message || 'Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password reset failed';
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

          <h2 className="text-2xl font-bold text-text-primary text-center mb-1">Set New Password</h2>
          <p className="text-text-secondary text-center text-sm mb-8">
            Create a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="input-field !pr-12"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Bar */}
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Password Strength:</span>
                  <span className={strength.text}>{strength.label}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 transition-all duration-300 ${validCount >= 1 ? strength.color : 'bg-gray-200'}`} />
                  <div className={`h-full flex-1 transition-all duration-300 ${validCount >= 3 ? strength.color : 'bg-gray-200'}`} />
                  <div className={`h-full flex-1 transition-all duration-300 ${validCount === 5 ? strength.color : 'bg-gray-200'}`} />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="input-field !pr-12"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
              <p className="font-bold text-text-secondary mb-2">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`flex items-center gap-1.5 ${criteria.length ? 'text-success font-semibold' : 'text-gray-400'}`}>
                  {criteria.length ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
                  Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.uppercase ? 'text-success font-semibold' : 'text-gray-400'}`}>
                  {criteria.uppercase ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.lowercase ? 'text-success font-semibold' : 'text-gray-400'}`}>
                  {criteria.lowercase ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.number ? 'text-success font-semibold' : 'text-gray-400'}`}>
                  {criteria.number ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
                  One number
                </div>
                <div className={`flex items-center gap-1.5 col-span-1 sm:col-span-2 ${criteria.special ? 'text-success font-semibold' : 'text-gray-400'}`}>
                  {criteria.special ? <HiCheck className="w-4 h-4 shrink-0" /> : <HiXMark className="w-4 h-4 shrink-0" />}
                  One special character (!@#$%^&*)
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-xs text-center font-semibold">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base disabled:opacity-60 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving New Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
