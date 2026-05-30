import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Droplets, TrendingUp, AlertCircle } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import RoleLayout from '../../layouts/RoleLayout';
import StatsCard from '../../components/StatsCard';
import InventoryBar from '../../components/InventoryBar';
import MapView from '../../components/MapView';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { BLOOD_TYPES } from '../../utils/constants';
import { DEFAULT_MAP_CENTER } from '../../utils/constants';

const BloodBankDashboard = () => {
  const { myBloodBank, fetchMyBloodBank, isLoading } = useInventoryStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchMyBloodBank();
  }, [fetchMyBloodBank]);

  if (isLoading) return <RoleLayout><div style={{ padding: '3rem' }}><LoadingSpinner /></div></RoleLayout>;

  if (!myBloodBank) {
    return (
      <RoleLayout>
        <EmptyState
          title="No blood bank linked"
          message="Create your blood bank first to start managing inventory."
          icon={FlaskConical}
          action={<Link to="/bloodbank/create" className="btn btn-primary">Create Blood Bank</Link>}
        />
      </RoleLayout>
    );
  }

  const inventory = myBloodBank.inventory || {};
  const totalUnits = BLOOD_TYPES.reduce((sum, bt) => sum + (inventory[bt]?.units || 0), 0);
  const lowStockTypes = BLOOD_TYPES.filter((bt) => (inventory[bt]?.units || 0) > 0 && (inventory[bt]?.units || 0) < 5);
  const emptyTypes = BLOOD_TYPES.filter((bt) => (inventory[bt]?.units || 0) === 0);

  const bankCoords = myBloodBank.location?.coordinates;
  const mapCenter = bankCoords ? [bankCoords[1], bankCoords[0]] : DEFAULT_MAP_CENTER;

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {myBloodBank.name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {myBloodBank.address?.city}, {myBloodBank.address?.state} · 📞 {myBloodBank.phone}
            </p>
          </div>
          <Link to="/bloodbank/inventory" className="btn btn-primary">
            <FlaskConical size={15} /> Manage Inventory
          </Link>
        </div>

        {/* Alerts */}
        {emptyTypes.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem', borderRadius: '0.875rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.9rem', marginBottom: 2 }}>
                Out of stock: {emptyTypes.join(', ')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Update inventory to help patients find available blood.
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Total Units" value={totalUnits} icon={Droplets} color="var(--color-blood)" />
          <StatsCard title="Blood Types Available" value={BLOOD_TYPES.filter(bt => (inventory[bt]?.units || 0) > 0).length} icon={FlaskConical} color="var(--color-info)" subtitle="out of 8 types" />
          <StatsCard title="Low Stock Types" value={lowStockTypes.length} icon={AlertCircle} color="var(--color-warning)" />
          <StatsCard title="Out of Stock" value={emptyTypes.length} icon={AlertCircle} color="var(--color-danger)" />
        </div>

        {/* Inventory Grid */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
              Live Inventory
            </h2>
            <Link to="/bloodbank/inventory" style={{ fontSize: '0.8125rem', color: 'var(--color-blood-light)', textDecoration: 'none', fontWeight: 600 }}>
              Edit inventory →
            </Link>
          </div>
          <InventoryBar inventory={inventory} />
        </div>

        {/* Map */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
            Location
          </h2>
          <MapView
            center={mapCenter}
            bloodBanks={[myBloodBank]}
            radiusKm={0}
            height="350px"
            zoom={14}
          />
        </div>
      </div>
    </RoleLayout>
  );
};

export default BloodBankDashboard;
