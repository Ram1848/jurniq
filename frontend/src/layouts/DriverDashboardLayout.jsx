import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../components/Navbar/DashboardNavbar/DashboardNavbar';
import DriverSidebar from '../components/Sidebar/DriverSidebar/DriverSidebar';

const DriverDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <DriverSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-20 lg:pl-64 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DriverDashboardLayout;
