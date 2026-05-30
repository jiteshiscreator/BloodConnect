import { useEffect, useState } from 'react';
import { Users, Droplets, Building2, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { useRequestStore } from '../../store/useRequestStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { usersApi } from '../../api/users.api';
import RoleLayout from '../../layouts/RoleLayout';
import StatsCard from '../../components/StatsCard';
import RequestCard from '../../components/RequestCard';
import InventoryBar from '../../components/InventoryBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import BloodTypeBadge from '../../components/BloodTypeBadge';

const AdminDashboard = () => {
  const { requests, fetchRequests, stats, fetchStats, updateRequestStatus, isLoading } = useRequestStore();
  const { bloodBanks, fetchBloodBanks } = useInventoryStore();
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRequests({ limit: 10 });
    fetchStats();
    fetchBloodBanks();
    usersApi.getStats().then(({ data }) => setUserStats(data.data)).catch(() => {});
    // Zustand store selectors are guaranteed stable — safe to include here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRequests, fetchStats, fetchBloodBanks]);

  const statusStats = stats?.byStatus || [];
  const findCount = (status) => statusStats.find((s) => s._id === status)?.count || 0;

  const bloodTypeStats = stats?.byBloodType || [];

  const TABS = ['overview', 'requests', 'blood banks'];

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(220,20,60,0.12) 0%, rgba(220,20,60,0.04) 100%)',
          border: '1px solid rgba(220,20,60,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🩸</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
              Admin Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Platform-wide overview for Emergency Blood Connector — Hyderabad</p>
        </div>

        {/* Platform stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Total Users" value={userStats?.totalUsers || '—'} icon={Users} color="var(--color-info)" />
          <StatsCard title="Active Donors" value={userStats?.activeDonors || '—'} icon={Users} color="var(--color-blood)" />
          <StatsCard title="Hospitals" value={userStats?.hospitals || '—'} icon={Building2} color="var(--color-info)" />
          <StatsCard title="Pending Requests" value={findCount('pending')} icon={Clock} color="var(--color-warning)" />
          <StatsCard title="Fulfilled" value={findCount('fulfilled')} icon={CheckCircle} color="var(--color-success)" />
          <StatsCard title="Blood Banks" value={bloodBanks.length} icon={Building2} color="#8b5cf6" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.625rem 1.25rem',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--color-blood)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--color-blood-light)' : 'var(--color-text-muted)',
                fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize', transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Blood type demand */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                Blood Type Demand
              </h2>
              {bloodTypeStats.length === 0 ? (
                <EmptyState title="No data yet" icon={BarChart3} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {bloodTypeStats.map((bt) => (
                    <div key={bt._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BloodTypeBadge bloodType={bt._id} />
                      <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4, background: 'var(--color-blood)',
                          width: `${Math.min(100, (bt.count / (bloodTypeStats[0]?.count || 1)) * 100)}%`,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 20 }}>{bt.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request status breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                Request Status Breakdown
              </h2>
              {statusStats.length === 0 ? (
                <EmptyState title="No data yet" icon={BarChart3} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {statusStats.map((s) => {
                    const colors = { pending: '#f59e0b', matched: '#3b82f6', fulfilled: '#10b981', cancelled: '#6b7280', expired: '#4b5563' };
                    return (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: 80, fontSize: '0.8125rem', fontWeight: 600, color: colors[s._id] || 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {s._id}
                        </span>
                        <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4, background: colors[s._id] || '#666',
                            width: `${Math.min(100, (s.count / (statusStats[0]?.count || 1)) * 100)}%`,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 20 }}>{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests tab */}
        {activeTab === 'requests' && (
          isLoading ? <LoadingSpinner /> :
          requests.length === 0 ? <EmptyState title="No requests" icon={Droplets} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {requests.map((req) => (
                <RequestCard key={req._id} request={req}
                  actions={
                    req.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateRequestStatus(req._id, 'matched')}>
                        Match
                      </button>
                    )
                  }
                />
              ))}
            </div>
          )
        )}

        {/* Blood banks tab */}
        {activeTab === 'blood banks' && (
          bloodBanks.length === 0 ? <EmptyState title="No blood banks" icon={Building2} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bloodBanks.map((bank) => (
                <div key={bank._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{bank.name}</h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{bank.address?.city}, {bank.address?.state} · 📞 {bank.phone}</p>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: bank.isVerified ? 'var(--color-success)' : 'var(--color-warning)',
                      background: bank.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      padding: '0.25rem 0.75rem', borderRadius: 9999,
                    }}>
                      {bank.isVerified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <InventoryBar inventory={bank.inventory} compact />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </RoleLayout>
  );
};

export default AdminDashboard;
