import { useState, useCallback, useEffect } from 'react';
import { HiOutlineMapPin, HiOutlineBanknotes, HiOutlineCreditCard, HiOutlineDevicePhoneMobile, HiOutlineCheckCircle } from 'react-icons/hi2';
import * as rideService from '../services/rideService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

import MapView from '../components/Map/MapView';
import LocationSearch from '../components/Map/LocationSearch';
import FareCard from '../components/Cards/BookRide/FareCard';
import RideSummaryCard from '../components/Cards/BookRide/RideSummaryCard';
import RecommendedDriverCard from '../components/Cards/RecommendedDriverCard/RecommendedDriverCard';
import { getRouteDetails, reverseGeocode } from '../services/mapService';

// Available vehicle types
const vehicles = ['bike', 'auto', 'mini', 'sedan', 'suv'];

const payments = [
  { method: 'cash', label: 'Cash', icon: HiOutlineBanknotes },
  { method: 'upi', label: 'UPI', icon: HiOutlineDevicePhoneMobile },
  { method: 'card', label: 'Card', icon: HiOutlineCreditCard },
];

const BookRide = () => {
  const [pickup, setPickup] = useState(null); // { address, lat, lng }
  const [drop, setDrop] = useState(null);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [polylineCoords, setPolylineCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distanceText, durationText }
  
  const [fares, setFares] = useState({}); // { mini: 150, sedan: 200 }
  const [vehicle, setVehicle] = useState('mini');
  const [payment, setPayment] = useState('cash');
  
  const [loadingFare, setLoadingFare] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookedRide, setBookedRide] = useState(null);

  const [recommendedDrivers, setRecommendedDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch recommended drivers when pickup or vehicle type changes
  useEffect(() => {
    if (pickup && vehicle) {
      const getRecs = async () => {
        setLoadingRecommendations(true);
        try {
          const res = await api.post('/api/recommend-driver', {
            pickupLocation: pickup.address,
            vehicleType: vehicle
          });
          setRecommendedDrivers(res.data.drivers || []);
          if (res.data.drivers && res.data.drivers.length > 0) {
            setSelectedDriverId(res.data.drivers[0].driver_id);
          } else {
            setSelectedDriverId(null);
          }
        } catch (err) {
          console.error('Failed to load recommended drivers:', err);
          setRecommendedDrivers([]);
        } finally {
          setLoadingRecommendations(false);
        }
      };
      getRecs();
    }
  }, [pickup, vehicle]);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLoc({ lat, lng });
        },
        () => {
          // Default center if user denies browser location permission
          setCurrentLoc({ lat: 16.5062, lng: 80.6480 });
        }
      );
    }
  }, []);

  const [gettingLocation, setGettingLocation] = useState(false);

  // Use Current Location helper
  const handleUseCurrentLocation = async () => {
    if (gettingLocation) return;
    setGettingLocation(true);

    const applyLocation = async (lat, lng) => {
      try {
        const address = await reverseGeocode(lat, lng);
        setPickup({
          address: address || 'Current Location',
          lat,
          lng,
        });
        toast.success('Pickup set to current location!');
      } catch (err) {
        setPickup({
          address: 'Current Location',
          lat,
          lng,
        });
        toast.success('Pickup set to current location!');
      } finally {
        setGettingLocation(false);
      }
    };

    if (currentLoc?.lat && currentLoc?.lng) {
      await applyLocation(currentLoc.lat, currentLoc.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLoc({ lat, lng });
          await applyLocation(lat, lng);
        },
        () => {
          toast.error('Could not access current location.');
          setGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation not supported by browser.');
      setGettingLocation(false);
    }
  };

  // Calculate route when both pickup and drop are set
  const calculateRoute = useCallback(async () => {
    if (!pickup?.lat || !drop?.lat) return;

    try {
      const route = await getRouteDetails(pickup, drop);
      if (!route) {
        toast.error('Could not calculate route');
        return;
      }

      setPolylineCoords(route.polylineCoords);
      setRouteInfo({ distanceText: route.distanceText, durationText: route.durationText });
      
      // Fetch dynamic fares from backend for all vehicles
      fetchFares(route.distanceText, route.durationText);
    } catch (err) {
      console.error('Route calculation error:', err);
      toast.error('Could not calculate route');
    }
  }, [pickup, drop]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const fetchFares = async (distanceText, durationText) => {
    setLoadingFare(true);
    try {
      const newFares = {};
      // Fetch fare for each vehicle type
      await Promise.all(
        vehicles.map(async (v) => {
          const res = await rideService.calculateFare({
            pickupLocation: pickup.address,
            dropLocation: drop.address,
            distanceText,
            durationText,
            vehicleType: v,
          });
          newFares[v] = res.data.fare;
        })
      );
      setFares(newFares);
    } catch (err) {
      console.error('Fare calculation error:', err);
      toast.error('Failed to calculate fares');
    } finally {
      setLoadingFare(false);
    }
  };

  const handleBookRide = async () => {
    if (!pickup || !drop) {
      toast.error('Please select pickup and drop locations');
      return;
    }
    if (!fares[vehicle]) {
      toast.error('Please wait for fare calculation');
      return;
    }

    setBooking(true);
    try {
      const res = await rideService.bookRide({
        pickup_location: pickup.address,
        drop_location: drop.address,
        vehicle_type: vehicle,
        payment_method: payment,
      });
      setBookedRide(res.ride);
      toast.success('Ride booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  // If successfully booked, show success screen
  if (bookedRide) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
          <HiOutlineCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ride Confirmed!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your ride has been successfully booked.</p>
          
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-6 text-left space-y-4 mb-8 border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Ride ID</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">#{bookedRide.ride_id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Pickup</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[200px] truncate">{bookedRide.pickup_location}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Drop</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[200px] truncate">{bookedRide.drop_location}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Vehicle</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{bookedRide.vehicle_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Fare</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">₹{bookedRide.fare}</span>
            </div>
          </div>

          <button onClick={() => window.location.href = '/ride-history'} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all">
            View Ride History
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Sidebar: Booking Form */}
      <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 pb-10 custom-scrollbar">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Where to?</h1>

        {/* Location Inputs */}
        <div className="glass-card p-5 space-y-4 relative">
          <div className="absolute left-[29px] top-11 bottom-11 w-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
          <LocationSearch 
            placeholder="Search Pickup Location (e.g. Vijayawada)" 
            value={pickup?.address || ''}
            onPlaceSelected={(place) => setPickup(place)} 
          />
          <LocationSearch 
            placeholder="Search Drop Location (e.g. Benz Circle)" 
            isDrop 
            value={drop?.address || ''}
            biasLocation={pickup}
            onPlaceSelected={(place) => setDrop(place)} 
          />
          {currentLoc && (
            <button 
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline mt-2 ml-1"
            >
              <HiOutlineMapPin className="w-4 h-4" /> Use Current Location
            </button>
          )}
        </div>

        {/* Vehicles List */}
        {polylineCoords && (
          <div className="space-y-3 mt-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recommended Rides</h3>
            {loadingFare ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map(v => fares[v] && (
                  <FareCard
                    key={v}
                    vehicleType={v}
                    fare={fares[v]}
                    durationText={routeInfo?.durationText}
                    isSelected={vehicle === v}
                    onClick={() => setVehicle(v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment & Summary */}
        {polylineCoords && !loadingFare && (
          <div className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {payments.map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayment(method)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    payment === method 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${payment === method ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                </button>
              ))}
            </div>

            {pickup && drop && (
              <RideSummaryCard
                pickup={pickup.address}
                drop={drop.address}
                distance={routeInfo?.distanceText}
                duration={routeInfo?.durationText}
                fare={fares[vehicle]}
                vehicleType={vehicle}
              />
            )}

            {/* AI Recommended Drivers */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Recommended Drivers</h3>
              {loadingRecommendations ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
                </div>
              ) : recommendedDrivers.length > 0 ? (
                <div className="space-y-3">
                  {recommendedDrivers.map(driver => (
                    <RecommendedDriverCard
                      key={driver.driver_id}
                      driver={driver}
                      selected={selectedDriverId === driver.driver_id}
                      onSelect={(d) => setSelectedDriverId(d.driver_id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                  No available drivers found for this vehicle type right now.
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={handleBookRide} 
              disabled={booking} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all text-lg mt-6 disabled:opacity-60"
            >
              {booking ? 'Confirming...' : `Confirm ${vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}`}
            </button>
          </div>
        )}
      </div>

      {/* Right Area: Map */}
      <div className="flex-1 h-[400px] lg:h-full relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <MapView 
          pickup={pickup} 
          drop={drop} 
          polylineCoords={polylineCoords} 
          currentLoc={currentLoc}
        />
      </div>

    </div>
  );
};

export default BookRide;
