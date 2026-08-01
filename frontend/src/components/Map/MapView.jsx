import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { memo } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 28.7041, // Default to New Delhi or user's location
  lng: 77.1025,
};

const MapView = ({ pickup, drop, directions, currentLoc }) => {
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={pickup || currentLoc || defaultCenter}
      zoom={14}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          // A light subtle map style for premium look
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
          { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
        ],
      }}
    >
      {/* Show current location marker if available */}
      {currentLoc && !directions && (
        <Marker
          position={currentLoc}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          }}
        />
      )}

      {/* Show pickup marker if no directions yet */}
      {pickup && !directions && (
        <Marker
          position={pickup}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          }}
        />
      )}

      {/* Show directions if available */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: '#0A84FF', // Primary color
              strokeWeight: 4,
            },
            suppressMarkers: false,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default memo(MapView);
