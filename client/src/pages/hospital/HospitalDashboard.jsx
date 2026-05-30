import { useEffect, useState, useMemo } from 'react';
import { Droplets, Users, CheckCircle, Clock, Search } from 'lucide-react';
import { useRequestStore } from '../../store/useRequestStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import RoleLayout from '../../layouts/RoleLayout';
import StatsCard from '../../components/StatsCard';
import RequestCard from '../../components/RequestCard';
import MapView from '../../components/MapView';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { usersApi } from '../../api/users.api';
import { BLOOD_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const HospitalDashboard = () => {
  const { requests, fetchRequests, updateRequestStatus, isLoading, stats, fetchStats } = useRequestStore();
  const { coords } = useGeolocation();
  const [donors, setDonors] = useState([]);
  const [searchBloodType, setSearchBloodType] = useState('');
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    fetchRequests({ status: 'pending' });
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRequests, fetchStats]);

  // Stable array for MapView — avoids Leaflet setView loop from inline [lat, lng]
  const mapCenter = useMemo(() => [coords.lat, coords.lng], [coords.lat, coords.lng]);

  const searchDonors = async () => {
    if (!searchBloodType) return toast.error('Select a blood type first');
    try {
      const { data } = await usersApi.searchDonors({ bloodType: searchBloodType, lat: coords.lat, lng: coords.lng, radius: 15000 });
      setDonors(data.data);
      setActiveTab('donors');
      toast.success(`Found ${data.count} eligible donors nearby`);
    } catch { toast.error('Search failed'); }
  };

  const handleMatch = async (reqId, donorId) => {
    const result = await updateRequestStatus(reqId, 'matched', donorId);
    if (result.success) toast.success('Donor matched to request!');
    else toast.error('Failed to match');
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const criticalRequests = requests.filter((r) => r.urgency === 'critical');

  const statusStats = stats?.byStatus || [];
  const getFulfilled = () => statusStats.find((s) => s._id === 'fulfilled')?.count || 0;
  const getPending = () => statusStats.find((s) => s._id === 'pending')?.count || 0;

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Hospital Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage blood requests and find donors in real time.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Pending Requests" value={getPending()} icon={Clock} color="var(--color-warning)" />
          <StatsCard title="Critical" value={criticalRequests.length} icon={Droplets} color="#ef4444" />
          <StatsCard title="Fulfilled" value={getFulfilled()} icon={CheckCircle} color="var(--color-success)" />
          <StatsCard title="Donors Found" value={donors.length} icon={Users} color="var(--color-info)" />
        </div>

        {/* Donor Search */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.875rem' }}>
            🔍 Find Nearby Donors
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="label">Blood Type</label>
              <select className="input" style={{ width: 'auto', minWidth: 120 }}
                value={searchBloodType} onChange={(e) => setSearchBloodType(e.target.value)}>
                <option value="">Select type</option>
                {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={searchDonors}>
              <Search size={15} /> Search (15km radius)
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
          {['requests', 'donors', 'map'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.625rem 1.25rem',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--color-blood)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--color-blood-light)' : 'var(--color-text-muted)',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'requests' ? `Pending Requests (${pendingRequests.length})` : tab === 'donors' ? `Donors (${donors.length})` : 'Map View'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'requests' && (
          isLoading ? <LoadingSpinner /> :
          pendingRequests.length === 0 ? (
            <EmptyState title="No pending requests" message="All blood requests have been handled." icon={Droplets} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {pendingRequests.map((req) => (
                <RequestCard key={req._id} request={req}
                  actions={
                    <button className="btn btn-primary btn-sm" onClick={() => handleMatch(req._id, null)}>
                      Mark Matched
                    </button>
                  }
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'donors' && (
          donors.length === 0 ? (
            <EmptyState title="No donors found" message="Search for donors by blood type above." icon={Users} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {donors.map((donor) => (
                <div key={donor._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{donor.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>🩸 {donor.bloodType} · {donor.city}</div>
                  {donor.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>📞 {donor.phone}</div>}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-success)' }}>✓ Eligible to donate</div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'map' && (
          <MapView
            center={mapCenter}
            donors={donors}
            requests={pendingRequests}
            radiusKm={15}
            height="500px"
          />
        )}
      </div>
    </RoleLayout>
  );
};

export default HospitalDashboard;
