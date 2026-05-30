import { useEffect, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import toast from 'react-hot-toast';
import api from '../../api/axios'; // Or use your bloodbank.api if set up

const RecipientMap = () => {
  const { coords, isLoading: geoLoading } = useGeolocation();
  const [bloodBanks, setBloodBanks] = useState([]);

  useEffect(() => {
    // Fetch blood banks from the backend
    const fetchBloodBanks = async () => {
      try {
        const { data } = await api.get('/bloodbanks');
        setBloodBanks(data.data || []);
      } catch (error) {
        toast.error('Failed to load blood banks');
      }
    };
    fetchBloodBanks();
  }, []);

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Nearby Blood Banks
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Locate registered blood banks around you.</p>
        </div>

        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          {geoLoading ? (
            <p>Locating you...</p>
          ) : (
            <MapView
              center={[coords.lat, coords.lng]}
              bloodBanks={bloodBanks}
              radiusKm={15}
              height="550px"
              zoom={13}
            />
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default RecipientMap;