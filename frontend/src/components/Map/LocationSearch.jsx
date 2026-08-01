import { Autocomplete } from '@react-google-maps/api';
import { HiOutlineMapPin } from 'react-icons/hi2';
import { useRef } from 'react';

const LocationSearch = ({ placeholder, onPlaceSelected, isDrop }) => {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        onPlaceSelected({
          address: place.formatted_address || place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <div className="relative">
      <HiOutlineMapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDrop ? 'text-danger' : 'text-success'}`} />
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
        options={{ componentRestrictions: { country: 'in' } }} // Customize country as needed
      >
        <input
          type="text"
          placeholder={placeholder}
          className="input-field !pl-11"
        />
      </Autocomplete>
    </div>
  );
};

export default LocationSearch;
