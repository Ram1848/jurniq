import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineCalendar, HiOutlineUser, HiOutlinePencilSquare } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import * as rideService from '../services/rideService';
import api from '../services/api';
import toast from 'react-hot-toast';
import EmergencyContacts from '../components/Cards/EmergencyContacts/EmergencyContacts';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ totalRides: 0, completedRides: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await rideService.getDashboardStats();
        setStats(res.stats);
      } catch { /* silent */ }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      updateUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 sm:p-10"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <span className="text-white text-3xl font-bold">{initials}</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{user?.full_name}</h2>
            <span className="mt-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
              {user?.role}
            </span>
          </div>

          {/* Info fields */}
          <div className="space-y-4 mb-8">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="input-field !pl-10 w-full"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email (Cannot be changed)</label>
                  <div className="relative">
                    <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      className="input-field !pl-10 w-full bg-gray-50 text-gray-500 cursor-not-allowed"
                      value={user?.email}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="input-field !pl-10 w-full"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
                {[
                  { icon: HiOutlineUser, label: 'Full Name', value: user?.full_name },
                  { icon: HiOutlineEnvelope, label: 'Email', value: user?.email },
                  { icon: HiOutlinePhone, label: 'Phone', value: user?.phone },
                  {
                    icon: HiOutlineCalendar,
                    label: 'Member Since',
                    value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-surface">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">{label}</p>
                      <p className="text-sm font-semibold text-text-primary">{value || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-primary/5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalRides}</p>
              <p className="text-xs text-text-secondary mt-1">Total Rides</p>
            </div>
            <div className="p-5 rounded-xl bg-success/5 text-center">
              <p className="text-2xl font-bold text-success">{stats.completedRides}</p>
              <p className="text-xs text-text-secondary mt-1">Completed</p>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contacts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmergencyContacts />
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
