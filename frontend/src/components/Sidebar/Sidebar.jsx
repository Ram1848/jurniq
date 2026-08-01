import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiXMark,
  HiOutlineBell,
  HiOutlineChartBar
} from 'react-icons/hi2';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HiOutlineSquares2X2 },
  { name: 'Book Ride', path: '/book-ride', icon: HiOutlineMapPin },
  { name: 'Ride History', path: '/ride-history', icon: HiOutlineClock },
  { name: 'Analytics', path: '/analytics', icon: HiOutlineChartBar },
  { name: 'Notifications', path: '/notifications', icon: HiOutlineBell },
  { name: 'Profile', path: '/profile', icon: HiOutlineUser },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 pt-20 pb-6 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close */}
        <button className="lg:hidden absolute top-5 right-4 p-1 text-text-secondary" onClick={onClose}>
          <HiXMark className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4">
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all w-full"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
