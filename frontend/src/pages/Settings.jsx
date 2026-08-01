import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/adminService';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newTheme;
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile.full_name.trim() || !profile.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setProfileLoading(true);
    try {
      await adminService.updateProfile(profile);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      await adminService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setPassLoading(false);
  };

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
      <p className="text-text-secondary text-sm mb-8">Manage your admin account</p>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-danger to-rose-400 flex items-center justify-center shadow-lg shadow-danger/20">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{user?.full_name}</h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-semibold">Admin</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-text-primary mb-4">Update Profile</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="relative">
              <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Full Name" className="input-field"
                value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" className="input-field !bg-gray-50 !cursor-not-allowed" value={user?.email || ''} disabled />
            </div>
            <div className="relative">
              <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" placeholder="Phone" className="input-field"
                value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <button type="submit" disabled={profileLoading} className="btn-primary !py-3 text-sm w-full sm:w-auto">
              {profileLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Theme Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                {isDarkMode ? <HiOutlineMoon className="w-5 h-5 text-primary" /> : <HiOutlineSun className="w-5 h-5 text-warning" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Dark Mode</p>
                <p className="text-xs text-text-secondary">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Password Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="Current Password" className="input-field !pr-12"
                value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary"
                onClick={() => setShowPass(!showPass)}>
                {showPass ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="New Password" className="input-field"
                value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="Confirm New Password" className="input-field"
                value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
            <button type="submit" disabled={passLoading} className="btn-secondary !py-3 text-sm w-full sm:w-auto">
              {passLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Updating...
                </span>
              ) : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
