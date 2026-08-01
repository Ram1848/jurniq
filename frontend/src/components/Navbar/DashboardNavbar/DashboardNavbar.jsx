import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBars3, HiOutlineBell, HiOutlineUserCircle } from 'react-icons/hi2';
import { useAuth } from '../../../context/AuthContext';
import NotificationBell from '../../Notifications/NotificationBell';

const DashboardNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 text-text-secondary hover:text-text-primary">
            <HiBars3 className="w-6 h-6" />
          </button>
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'driver' ? '/driver-dashboard' : '/dashboard'} className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-lg font-bold text-text-primary hidden sm:block">
              Ride<span className="text-primary">Share</span>
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:block">{user?.full_name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <Link
                  to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'driver' ? '/driver/profile' : '/profile'}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 no-underline"
                  onClick={() => setDropdownOpen(false)}
                >
                  <HiOutlineUserCircle className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
