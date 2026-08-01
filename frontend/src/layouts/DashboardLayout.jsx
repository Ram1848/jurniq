import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../components/Navbar/DashboardNavbar/DashboardNavbar';
import Sidebar from '../components/Sidebar/Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — offset for fixed navbar and sidebar */}
      <main className="pt-20 lg:pl-64 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
