import { useState, useEffect, useCallback, memo } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useSocket } from '../../context/SocketContext';

const mapContainerStyle = { width: '100%', height: '100%' };

const LiveTrackingMap = ({ rideId, pickup, drop, initialDriverLocation }) => {
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const socket = useSocket();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Load directions route once
  useEffect(() => {
    if (!pickup || !drop || !window.google) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickup,
        destination: drop,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [pickup, drop]);

  // Listen to live driver location updates
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId === rideId && data.lat && data.lng) {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('locationUpdated', handleLocationUpdate);
    return () => socket.off('locationUpdated', handleLocationUpdate);
  }, [socket, rideId]);

  // Auto-pan map to driver location
  useEffect(() => {
    if (map && driverLocation) {
      map.panTo(driverLocation);
    }
  }, [map, driverLocation]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    if (driverLocation) {
      mapInstance.panTo(driverLocation);
    }
  }, [driverLocation]);

  const onUnmount = useCallback(() => setMap(null), []);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-text-secondary">Loading map...</div>;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner min-h-[300px]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={driverLocation || pickup}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: { strokeColor: '#000000', strokeWeight: 4 },
              suppressMarkers: false,
            }}
          />
        )}
        
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: window.google ? new window.google.maps.Size(40, 40) : null
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default memo(LiveTrackingMap);
