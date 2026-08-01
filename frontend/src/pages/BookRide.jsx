import { useState, useCallback, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
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

// Available vehicle types
const vehicles = ['bike', 'auto', 'mini', 'sedan', 'suv'];

const payments = [
  { method: 'cash', label: 'Cash', icon: HiOutlineBanknotes },
  { method: 'upi', label: 'UPI', icon: HiOutlineDevicePhoneMobile },
  { method: 'card', label: 'Card', icon: HiOutlineCreditCard },
];

const libraries = ['places'];

const BookRide = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [pickup, setPickup] = useState(null); // { address, lat, lng }
  const [drop, setDrop] = useState(null);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [directions, setDirections] = useState(null);
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
          setRecommendedDrivers(res.data.drivers);
          if (res.data.drivers.length > 0) {
            setSelectedDriverId(res.data.drivers[0].driver_id);
          } else {
            setSelectedDriverId(null);
          }
        } catch (err) {
          console.error(err);
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
        (pos) => {
          setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => toast.error('Could not get current location')
      );
    }
  }, []);

  // Calculate route when both pickup and drop are set
  const calculateRoute = useCallback(async () => {
    if (!pickup || !drop || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: pickup,
        destination: drop,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirections(results);
      const leg = results.routes[0].legs[0];
      const dist = leg.distance.text;
      const dur = leg.duration.text;
      
      setRouteInfo({ distanceText: dist, durationText: dur });
      
      // Fetch dynamic fares from backend for all vehicles
      fetchFares(dist, dur);
    } catch (err) {
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
        // Backend overrides distance based on simulation currently,
        // but we pass our real data to the backend API anyway.
      });
      setBookedRide(res.ride);
      toast.success('Ride booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  // If successfully booked, show success screen
  if (bookedRide) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
          <HiOutlineCheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-text-primary mb-2">Ride Confirmed!</h2>
          <p className="text-text-secondary mb-8">Your ride has been successfully booked.</p>
          
          <div className="bg-surface rounded-2xl p-6 text-left space-y-4 mb-8">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-text-secondary">Ride ID</span>
              <span className="font-semibold text-text-primary">#{bookedRide.ride_id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-text-secondary">Pickup</span>
              <span className="font-semibold text-text-primary text-right max-w-[200px] truncate">{bookedRide.pickup_location}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-text-secondary">Drop</span>
              <span className="font-semibold text-text-primary text-right max-w-[200px] truncate">{bookedRide.drop_location}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-text-secondary">Vehicle</span>
              <span className="font-semibold text-text-primary capitalize">{bookedRide.vehicle_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fare</span>
              <span className="font-bold text-primary text-lg">₹{bookedRide.fare}</span>
            </div>
          </div>

          <button onClick={() => window.location.href = '/ride-history'} className="btn-primary w-full py-4">
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
        <h1 className="text-2xl font-bold text-text-primary">Where to?</h1>

        {/* Location Inputs */}
        <div className="glass-card p-5 space-y-4 relative">
          <div className="absolute left-[29px] top-11 bottom-11 w-0.5 bg-gray-200 z-0" />
          <LocationSearch 
            placeholder="Search Pickup Location" 
            onPlaceSelected={(place) => setPickup(place)} 
          />
          <LocationSearch 
            placeholder="Search Drop Location" 
            isDrop 
            onPlaceSelected={(place) => setDrop(place)} 
          />
          {!pickup && currentLoc && (
            <button 
              onClick={() => {
                // Approximate current location string
                setPickup({ address: 'Current Location', lat: currentLoc.lat, lng: currentLoc.lng });
              }}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline mt-2 ml-1"
            >
              <HiOutlineMapPin className="w-4 h-4" /> Use Current Location
            </button>
          )}
        </div>

        {/* Vehicles List */}
        {directions && (
          <div className="space-y-3 mt-2">
            <h3 className="text-sm font-semibold text-text-primary">Recommended Rides</h3>
            {loadingFare ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
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
        {directions && !loadingFare && (
          <div className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {payments.map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => setPayment(method)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    payment === method ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${payment === method ? 'text-primary' : 'text-gray-400'}`} />
                  <p className="text-xs font-semibold text-text-primary">{label}</p>
                </button>
              ))}
            </div>

            <RideSummaryCard
              pickup={pickup.address}
              drop={drop.address}
              distance={routeInfo?.distanceText}
              duration={routeInfo?.durationText}
              fare={fares[vehicle]}
              vehicleType={vehicle}
            />

            {/* AI Recommended Drivers */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3">AI Recommended Drivers</h3>
              {loadingRecommendations ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
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
                <div className="text-sm text-text-secondary bg-surface p-4 rounded-xl text-center">
                  No available drivers found for this vehicle type right now.
                </div>
              )}
            </div>

            <button 
              onClick={handleBookRide} 
              disabled={booking || (!selectedDriverId && recommendedDrivers.length > 0)} 
              className="btn-primary w-full py-4 text-lg mt-6"
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
          directions={directions} 
          currentLoc={currentLoc}
        />
      </div>

    </div>
  );
};

export default BookRide;
