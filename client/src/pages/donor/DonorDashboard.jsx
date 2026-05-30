import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Heart, History, MapPin, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRequestStore } from '../../store/useRequestStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import RoleLayout from '../../layouts/RoleLayout';
import EligibilityCountdown from '../../components/EligibilityCountdown';
import RequestCard from '../../components/RequestCard';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { usersApi } from '../../api/users.api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const { user } = useAuthStore();
  const { nearbyRequests, fetchNearbyRequests, isLoading } = useRequestStore();
  const { coords } = useGeolocation();
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    fetchNearbyRequests({ lat: coords.lat, lng: coords.lng });
    usersApi.getEligibility().then(({ data }) => setEligibility(data.data)).catch(() => {});
  }, [coords.lat, coords.lng]);

  const handleRespond = (requestId) => {
    toast('Feature coming soon — contact the hospital directly for now.', {
      icon: '📞',
      style: { background: '#16161f', color: '#fff' },
    });
  };

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem' }}>
            Donor Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Hello, {user?.name?.split(' ')[0]} 👋 — thank you for being a lifesaver.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatsCard
            title="Total Donations"
            value={user?.donationCount || 0}
            subtitle="Lives contributed to"
            icon={Heart}
            color="var(--color-blood)"
          />
          <StatsCard
            title="Status"
            value={user?.isEligible ? 'Eligible ✓' : 'On Cooldown'}
            subtitle="56-day donation rule"
            icon={Droplets}
            color={user?.isEligible ? 'var(--color-success)' : 'var(--color-warning)'}
          />
          <StatsCard
            title="Nearby Requests"
            value={nearbyRequests.length}
            subtitle={`Within 15km in ${user?.city || 'Hyderabad'}`}
            icon={MapPin}
            color="var(--color-info)"
          />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Eligibility */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Eligibility Status
            </h2>
            <EligibilityCountdown
              lastDonated={user?.lastDonated}
              isEligible={user?.isEligible}
              size={180}
            />
            <Link to="/donor/history" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <History size={14} /> View History
            </Link>
          </div>

          {/* Right: Nearby requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
                🚨 Nearby Emergency Requests
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Blood type: {user?.bloodType}
              </span>
            </div>

            {isLoading ? (
              <div style={{ padding: '2rem' }}><LoadingSpinner /></div>
            ) : nearbyRequests.length === 0 ? (
              <EmptyState
                title="No nearby requests"
                message={`No ${user?.bloodType} blood requests within 15km. Check back soon.`}
                icon={AlertCircle}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {nearbyRequests.map((req) => (
                  <RequestCard
                    key={req._id || req.requestId}
                    request={req}
                    actions={
                      user?.isEligible ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRespond(req._id)}
                        >
                          <Heart size={13} /> Respond
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Not eligible yet
                        </span>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default DonorDashboard;
