import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DriverDashboardLayout from './layouts/DriverDashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute/AdminProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import RiderDashboard from './pages/RiderDashboard';
import BookRide from './pages/BookRide';
import ActiveRide from './pages/ActiveRide';
import PaymentPage from './pages/PaymentPage';
import PaymentHistory from './pages/PaymentHistory';
import NotificationCenter from './pages/NotificationCenter';
import RideHistory from './pages/RideHistory';
import Profile from './pages/Profile';
import DriverDashboard from './pages/DriverDashboard';
import RideRequests from './pages/RideRequests';
import Earnings from './pages/Earnings';
import DriverRideHistory from './pages/DriverRideHistory';
import DriverProfile from './pages/DriverProfile';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import DriversManagement from './pages/DriversManagement';
import RideManagement from './pages/RideManagement';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ChatBot from './components/Chat/ChatBot';
import RideAnalytics from './pages/RideAnalytics';
import EcoDashboard from './pages/EcoDashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
        {/* Public pages with Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth pages — no layout chrome */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected rider dashboard pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<RiderDashboard />} />
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/active-ride" element={<ActiveRide />} />
            <Route path="/payment/history" element={<PaymentHistory />} />
            <Route path="/payment/:rideId" element={<PaymentPage />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/ride-history" element={<RideHistory />} />
            <Route path="/analytics" element={<RideAnalytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected driver dashboard pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DriverDashboardLayout />}>
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/driver/ride-requests" element={<RideRequests />} />
            <Route path="/driver/active-ride" element={<ActiveRide />} />
            <Route path="/driver/earnings" element={<Earnings />} />
            <Route path="/driver/history" element={<DriverRideHistory />} />
            <Route path="/driver/notifications" element={<NotificationCenter />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
          </Route>
        </Route>

        {/* Protected admin dashboard pages */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminDashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/drivers" element={<DriversManagement />} />
            <Route path="/admin/rides" element={<RideManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/eco-dashboard" element={<EcoDashboard />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Global Floating Ride Assistant */}
        <ChatBot />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
