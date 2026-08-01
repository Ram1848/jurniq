import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMapPin, HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineMap, HiOutlineTruck, HiOutlinePresentationChartLine } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import EcoBadgeCard from '../components/Cards/EcoBadgeCard/EcoBadgeCard';
import { RideCountChart, CO2SavedChart, SpendingChart } from '../components/Cards/AnalyticsCharts/AnalyticsCharts';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-extrabold text-text-primary">{value}</h3>
        {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
      </div>
    </div>
  </div>
);

const RideAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/personal');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton height="200px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <LoadingSkeleton key={i} height="120px" />)}
        </div>
      </div>
    );
  }

  if (!data || !data.stats) {
    return <div className="p-6 text-center text-text-secondary">No data available</div>;
  }

  const { stats, monthly } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">My Analytics & Eco Score</h1>
        <p className="text-text-secondary">Track your ride statistics and environmental impact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <EcoBadgeCard badge={stats.ecoBadge} co2Saved={stats.totalCO2Saved} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard 
            icon={HiOutlineMap} 
            label="Total Distance" 
            value={`${stats.totalDistance} km`} 
            subtext={`${stats.avgDistance} km per ride avg`}
            colorClass="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            icon={HiOutlineCurrencyRupee} 
            label="Total Spent" 
            value={`₹${stats.totalSpent}`} 
            subtext={`₹${stats.avgCost} per ride avg`}
            colorClass="bg-green-100 text-green-600" 
          />
          <StatCard 
            icon={HiOutlineClock} 
            label="Total Time Travelling" 
            value={`${stats.totalHours} hrs`} 
            colorClass="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            icon={HiOutlinePresentationChartLine} 
            label="Green Ride %" 
            value={`${stats.greenPercentage}%`} 
            subtext={`${stats.totalSharedRides} Total Rides taken`}
            colorClass="bg-emerald-100 text-emerald-600" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-l-4 border-l-primary">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Favorite Vehicle</p>
          <h4 className="text-xl font-bold capitalize flex items-center gap-2">
            <HiOutlineTruck className="w-5 h-5 text-primary" /> {stats.favoriteVehicle}
          </h4>
        </div>
        <div className="glass-card p-6 border border-l-4 border-l-accent">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Top Pickup Location</p>
          <h4 className="text-lg font-bold flex items-start gap-2 truncate">
            <HiOutlineMapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" /> 
            <span className="truncate">{stats.favoritePickup}</span>
          </h4>
        </div>
        <div className="glass-card p-6 border border-l-4 border-l-danger">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Top Destination</p>
          <h4 className="text-lg font-bold flex items-start gap-2 truncate">
            <HiOutlineMapPin className="w-5 h-5 text-danger shrink-0 mt-0.5" /> 
            <span className="truncate">{stats.favoriteDrop}</span>
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CO2SavedChart data={monthly} />
        <RideCountChart data={monthly} />
        <SpendingChart data={monthly} />
      </div>
    </div>
  );
};

export default RideAnalytics;
