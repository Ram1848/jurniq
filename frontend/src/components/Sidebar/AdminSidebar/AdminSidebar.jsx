import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineChartBarSquare,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiXMark,
  HiOutlineGlobeAsiaAustralia
} from 'react-icons/hi2';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HiOutlineSquares2X2 },
  { name: 'Users', path: '/admin/users', icon: HiOutlineUsers },
  { name: 'Drivers', path: '/admin/drivers', icon: HiOutlineTruck },
  { name: 'Rides', path: '/admin/rides', icon: HiOutlineMapPin },
  { name: 'Analytics', path: '/admin/analytics', icon: HiOutlineChartBarSquare },
  { name: 'Eco Impact', path: '/admin/eco-dashboard', icon: HiOutlineGlobeAsiaAustralia },
  { name: 'Reports', path: '/admin/reports', icon: HiOutlineDocumentText },
  { name: 'Settings', path: '/admin/settings', icon: HiOutlineCog6Tooth },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 pt-20 pb-6 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button className="lg:hidden absolute top-5 right-4 p-1 text-text-secondary" onClick={onClose}>
          <HiXMark className="w-5 h-5" />
        </button>

        {/* Admin badge */}
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-xs font-semibold text-danger">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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

export default AdminSidebar;
