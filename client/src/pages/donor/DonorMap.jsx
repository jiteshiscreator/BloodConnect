import { useEffect } from 'react';
import RoleLayout from '../../layouts/RoleLayout';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useRequestStore } from '../../store/useRequestStore';
import LoadingSpinner from '../../components/LoadingSpinner';

const DonorMap = () => {
  const { coords, isLoading: geoLoading } = useGeolocation();
  const { nearbyRequests, fetchNearbyRequests } = useRequestStore();

  useEffect(() => {
    fetchNearbyRequests({ lat: coords.lat, lng: coords.lng });
  }, [coords.lat, coords.lng, fetchNearbyRequests]);

  return (
    <RoleLayout>
       <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Nearby Requests Map</h1>
       <div className="card" style={{ padding: '0.5rem' }}>
         {geoLoading ? <LoadingSpinner /> : (
            <MapView center={[coords.lat, coords.lng]} requests={nearbyRequests} radiusKm={15} height="600px" zoom={13} />
         )}
       </div>
    </RoleLayout>
  );
};
export default DonorMap;