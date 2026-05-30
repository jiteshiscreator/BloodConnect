import { useState, useEffect } from 'react';
import { DEFAULT_MAP_CENTER } from '../utils/constants';

/**
 * Hook to access browser Geolocation with Hyderabad fallback.
 * Returns { coords: { lat, lng }, error, isLoading }
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState({ lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using Hyderabad as default.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLoading(false);
      },
      (err) => {
        setError(`Location access denied. Using Hyderabad default. (${err.message})`);
        setIsLoading(false);
        // Keep Hyderabad as default
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { coords, error, isLoading };
};
