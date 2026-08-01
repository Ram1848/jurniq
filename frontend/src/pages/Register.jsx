import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { FaCar, FaUserAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-danger', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-warning', width: '66%' };
  return { label: 'Strong', color: 'bg-success', width: '100%' };
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'rider',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10,15}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Invalid phone number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      toast.success('Registration successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const fields = [
    { key: 'full_name', icon: HiOutlineUser, placeholder: 'Full Name', type: 'text' },
    { key: 'email', icon: HiOutlineEnvelope, placeholder: 'Email Address', type: 'email' },
    { key: 'phone', icon: HiOutlinePhone, placeholder: 'Phone Number', type: 'tel' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-blue-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
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

          <h2 className="text-2xl font-bold text-text-primary text-center mb-1">Create Account</h2>
          <p className="text-text-secondary text-center text-sm mb-8">Start your ride-sharing journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text fields */}
            {fields.map(({ key, icon: Icon, placeholder, type }) => (
              <div key={key}>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    className={`input-field ${errors[key] ? '!border-danger' : ''}`}
                    value={form[key]}
                    onChange={set(key)}
                  />
                </div>
                {errors[key] && <p className="text-danger text-xs mt-1 ml-1">{errors[key]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  className={`input-field !pr-12 ${errors.password ? '!border-danger' : ''}`}
                  value={form.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1 ml-1">{errors.password}</p>}
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className={`input-field ${errors.confirmPassword ? '!border-danger' : ''}`}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-danger text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Role selection */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">I want to</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { role: 'rider', label: 'Ride', icon: FaUserAlt, desc: 'Book rides' },
                  { role: 'driver', label: 'Drive', icon: FaCar, desc: 'Earn money' },
                ].map(({ role, label, icon: Icon, desc }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.role === role
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1.5 ${form.role === role ? 'text-primary' : 'text-gray-400'}`} />
                    <p className={`text-sm font-semibold ${form.role === role ? 'text-primary' : 'text-text-primary'}`}>{label}</p>
                    <p className="text-xs text-text-secondary">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline no-underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
