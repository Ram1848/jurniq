import { useState, useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import { useSocket } from '../../context/SocketContext';
import { getRouteDetails, searchLocations } from '../../services/mapService';

const createCustomIcon = (color, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
      ${label ? `<text x="12" y="16" font-size="9" font-weight="bold" text-anchor="middle" fill="${color}">${label}</text>` : ''}
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
};

const driverCarIcon = L.divIcon({
  className: 'driver-car-marker',
  html: `
    <div style="width: 32px; height: 32px; background: #4F46E5; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.6); color: white; font-size: 16px;">
      🚗
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const LiveTrackingMap = ({ rideId, pickup, drop, initialDriverLocation }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const socket = useSocket();

  const [driverLoc, setDriverLoc] = useState(initialDriverLocation);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.5062, 80.6480], // Default location
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch Pickup & Drop route if strings are provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickup || !drop) return;

    const loadRoute = async () => {
      try {
        let pickupObj = typeof pickup === 'object' ? pickup : null;
        let dropObj = typeof drop === 'object' ? drop : null;

        if (!pickupObj && typeof pickup === 'string') {
          const res = await searchLocations(pickup);
          if (res.length > 0) pickupObj = res[0];
        }
        if (!dropObj && typeof drop === 'string') {
          const res = await searchLocations(drop);
          if (res.length > 0) dropObj = res[0];
        }

        if (pickupObj && dropObj) {
          // Add Markers
          L.marker([pickupObj.lat, pickupObj.lng], { icon: createCustomIcon('#10B981', 'P') })
            .addTo(map)
            .bindPopup('Pickup Location');
          L.marker([dropObj.lat, dropObj.lng], { icon: createCustomIcon('#EF4444', 'D') })
            .addTo(map)
            .bindPopup('Drop Location');

          // Add Route
          const route = await getRouteDetails(pickupObj, dropObj);
          if (route && route.polylineCoords) {
            if (polylineRef.current) map.removeLayer(polylineRef.current);
            polylineRef.current = L.polyline(route.polylineCoords, {
              color: '#4F46E5',
              weight: 5,
              opacity: 0.85,
            }).addTo(map);

            map.fitBounds(L.latLngBounds([pickupObj.lat, pickupObj.lng], [dropObj.lat, dropObj.lng]), {
              padding: [40, 40],
            });
          }
        }
      } catch (err) {
        console.error('Failed to load tracking map route:', err);
      }
    };

    loadRoute();
  }, [pickup, drop]);

  // Listen for socket location updates
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId === rideId && data.lat && data.lng) {
        setDriverLoc({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('locationUpdated', handleLocationUpdate);
    return () => socket.off('locationUpdated', handleLocationUpdate);
  }, [socket, rideId]);

  // Update Driver Marker Position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !driverLoc?.lat || !driverLoc?.lng) return;

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLoc.lat, driverLoc.lng]);
    } else {
      driverMarkerRef.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: driverCarIcon })
        .addTo(map)
        .bindPopup('Driver Location');
    }

    map.panTo([driverLoc.lat, driverLoc.lng]);
  }, [driverLoc]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner min-h-[300px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0" />
    </div>
  );
};

export default memo(LiveTrackingMap);
