import { useEffect, useRef, memo } from 'react';
import L from 'leaflet';

// Create custom SVG markers for Leaflet
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
    popupAnchor: [0, -42],
  });
};

const pickupIcon = createCustomIcon('#10B981', 'P'); // Green
const dropIcon = createCustomIcon('#EF4444', 'D'); // Red
const currentLocIcon = L.divIcon({
  className: 'current-location-marker',
  html: `<div style="width: 18px; height: 18px; background-color: #3B82F6; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const defaultCenter = [28.7041, 77.1025]; // New Delhi default

const MapView = ({ pickup, drop, polylineCoords, currentLoc }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = pickup
      ? [pickup.lat, pickup.lng]
      : currentLoc
      ? [currentLoc.lat, currentLoc.lng]
      : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Add sleek CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Add Zoom Control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Clear polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const boundsPoints = [];

    // Add Current Location Marker
    if (currentLoc?.lat && currentLoc?.lng) {
      const marker = L.marker([currentLoc.lat, currentLoc.lng], { icon: currentLocIcon }).addTo(map);
      marker.bindPopup('Current Location');
      markersRef.current.push(marker);
      boundsPoints.push([currentLoc.lat, currentLoc.lng]);
    }

    // Add Pickup Marker
    if (pickup?.lat && pickup?.lng) {
      const marker = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      marker.bindPopup(`<b>Pickup:</b> ${pickup.address || 'Selected Location'}`);
      markersRef.current.push(marker);
      boundsPoints.push([pickup.lat, pickup.lng]);
    }

    // Add Drop Marker
    if (drop?.lat && drop?.lng) {
      const marker = L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map);
      marker.bindPopup(`<b>Drop:</b> ${drop.address || 'Selected Location'}`);
      markersRef.current.push(marker);
      boundsPoints.push([drop.lat, drop.lng]);
    }

    // Add Route Polyline
    if (polylineCoords && polylineCoords.length > 0) {
      const polyline = L.polyline(polylineCoords, {
        color: '#4F46E5', // Primary Indigo
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // Auto fit map bounds if points exist
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14);
    }
  }, [pickup, drop, polylineCoords, currentLoc]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner border border-gray-100">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />
    </div>
  );
};

export default memo(MapView);
