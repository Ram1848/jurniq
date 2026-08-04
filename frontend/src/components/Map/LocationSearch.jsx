import { useState, useEffect, useRef } from 'react';
import { HiOutlineMapPin, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { searchLocations } from '../../services/mapService';

const LocationSearch = ({ placeholder, onPlaceSelected, isDrop, value, biasLocation }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync internal query with external value prop
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value || '');
    }
  }, [value]);

  // Debounced place search with location bias towards biasLocation (e.g. Pickup point)
  useEffect(() => {
    if (!query.trim() || query.length < 2 || query === value) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchLocations(query, biasLocation);
      setResults(data);
      setIsOpen(data.length > 0);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, value, biasLocation]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    setQuery(place.name || place.address);
    setIsOpen(false);
    onPlaceSelected(place);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <HiOutlineMapPin
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 z-10 ${
            isDrop ? 'text-red-500' : 'text-emerald-500'
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin z-10" />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((place, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700/50 flex items-start gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/30 last:border-none"
            >
              <HiOutlineMagnifyingGlass className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {place.name}
                  </p>
                  {place.distanceKm !== null && place.distanceKm !== undefined && (
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-md shrink-0">
                      ~{place.distanceKm.toFixed(1)} km away
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {place.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
