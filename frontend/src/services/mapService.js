import axios from 'axios';

/**
 * Calculate distance between two lat/lng points in km (Haversine formula)
 */
export const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Search locations with Location Bias & Proximity Sorting (Uber/Ola/Rapido style)
 * @param {string} query - Search term
 * @param {object} biasLocation - { lat, lng } coordinates to bias search towards (e.g. Pickup point)
 */
export const searchLocations = async (query, biasLocation = null) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = {
      format: 'json',
      q: query,
      'accept-language': 'en', // Force English response
      addressdetails: 1,
      limit: 10,
    };

    // Apply ~35km bounding box (viewbox) bias around pickup location if provided
    if (biasLocation?.lat && biasLocation?.lng) {
      const delta = 0.35; // ~35 km radius
      const minLng = biasLocation.lng - delta;
      const minLat = biasLocation.lat - delta;
      const maxLng = biasLocation.lng + delta;
      const maxLat = biasLocation.lat + delta;

      params.viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;
      params.bounded = 0; // Prioritize viewbox area while allowing global fallback if no local matches
    }

    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params,
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'JurniqApp/1.0 (contact@jurniq.com)',
      },
    });

    let items = res.data.map((item) => {
      const itemLat = parseFloat(item.lat);
      const itemLng = parseFloat(item.lon);
      const dist = biasLocation?.lat && biasLocation?.lng
        ? getHaversineDistance(biasLocation.lat, biasLocation.lng, itemLat, itemLng)
        : null;

      return {
        address: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        lat: itemLat,
        lng: itemLng,
        distanceKm: dist,
      };
    });

    // If bias location is provided, sort suggestions so nearby locations appear FIRST
    if (biasLocation?.lat && biasLocation?.lng) {
      items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return items.slice(0, 5);
  } catch (error) {
    console.error('Geocoding search failed:', error);
    return [];
  }
};

/**
 * Reverse geocode lat/lng to address (Always in English)
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon: lng,
        'accept-language': 'en', // Force English response
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'JurniqApp/1.0 (contact@jurniq.com)',
      },
    });
    return res.data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocode failed:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

/**
 * Get route details between pickup and drop using OSRM Routing API
 */
export const getRouteDetails = async (pickup, drop) => {
  if (!pickup?.lat || !pickup?.lng || !drop?.lat || !drop?.lng) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'JurniqApp/1.0 (contact@jurniq.com)',
      },
    });

    if (res.data && res.data.routes && res.data.routes.length > 0) {
      const route = res.data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMins = Math.ceil(route.duration / 60);

      // OSRM geometry coordinates are [lng, lat]. Leaflet needs [lat, lng].
      const polylineCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      return {
        distanceKm: parseFloat(distanceKm),
        durationMins,
        distanceText: `${distanceKm} km`,
        durationText: `${durationMins} mins`,
        polylineCoords,
      };
    }
  } catch (error) {
    console.error('Route calculation failed:', error);
  }

  // Fallback linear distance if route service fails
  const rad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = rad(drop.lat - pickup.lat);
  const dLng = rad(drop.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(pickup.lat)) * Math.cos(rad(drop.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = (R * c * 1.3).toFixed(1);
  const dur = Math.ceil(dist * 2.5);

  return {
    distanceKm: parseFloat(dist),
    durationMins: dur,
    distanceText: `${dist} km`,
    durationText: `${dur} mins`,
    polylineCoords: [
      [pickup.lat, pickup.lng],
      [drop.lat, drop.lng],
    ],
  };
};
