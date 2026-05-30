import { useEffect, useState } from 'react';
import { Droplets, Calendar, Building2 } from 'lucide-react';
import RoleLayout from '../../layouts/RoleLayout';
import { donationsApi } from '../../api/donations.api';
import BloodTypeBadge from '../../components/BloodTypeBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatDateTime } from '../../utils/formatters';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchDonations = async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await donationsApi.getMy({ page, limit: 10 });
      setDonations(data.data);
      setPagination(data.pagination);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDonations(); }, []);

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Donation History
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {pagination.total} total donation{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem' }}><LoadingSpinner /></div>
        ) : donations.length === 0 ? (
          <EmptyState
            title="No donations yet"
            message="Your donation history will appear here after your first donation."
            icon={Droplets}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {donations.map((donation, index) => (
              <div key={donation._id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--color-blood-muted)',
                    border: '2px solid var(--color-blood)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', zIndex: 1, flexShrink: 0,
                  }}>
                    🩸
                  </div>
                  {index < donations.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: 'var(--color-border)', minHeight: 24 }} />
                  )}
                </div>

                {/* Card */}
                <div className="card" style={{ flex: 1, marginBottom: '1rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BloodTypeBadge bloodType={donation.bloodType} size="md" />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {donation.units} unit{donation.units > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: donation.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-muted)',
                      background: donation.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'var(--color-bg-elevated)',
                      padding: '0.2rem 0.625rem', borderRadius: '9999px',
                    }}>
                      {donation.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {donation.bloodBank && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <Building2 size={13} />
                        <span>{donation.bloodBank.name}</span>
                      </div>
                    )}
                    {donation.bloodRequest && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <Droplets size={13} />
                        <span>For: {donation.bloodRequest.patientName} at {donation.bloodRequest.hospital?.name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={13} />
                      <span>{formatDateTime(donation.donatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchDonations(p)}
                className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default DonationHistory;
