import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Droplets, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRequestStore } from '../../store/useRequestStore';
import RoleLayout from '../../layouts/RoleLayout';
import StatsCard from '../../components/StatsCard';
import RequestCard from '../../components/RequestCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const RecipientDashboard = () => {
  const { user } = useAuthStore();
  const { requests, fetchRequests, cancelRequest, isLoading } = useRequestStore();

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRequests]);

  const myRequests = requests.filter((r) => r.requestedBy?._id === user?._id || r.requestedBy === user?._id);

  const pending = myRequests.filter((r) => r.status === 'pending').length;
  const matched = myRequests.filter((r) => r.status === 'matched' || r.status === 'in_progress').length;
  const fulfilled = myRequests.filter((r) => r.status === 'fulfilled').length;

  return (
    <RoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              My Requests
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Track your blood requests in real time.</p>
          </div>
          <Link to="/recipient/create" className="btn btn-primary">
            <PlusCircle size={16} /> New Request
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Pending" value={pending} icon={Clock} color="var(--color-warning)" />
          <StatsCard title="Matched" value={matched} icon={Droplets} color="var(--color-info)" />
          <StatsCard title="Fulfilled" value={fulfilled} icon={CheckCircle} color="var(--color-success)" />
          <StatsCard title="Total Requests" value={myRequests.length} icon={Droplets} color="var(--color-blood)" />
        </div>

        {/* Request list */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
            All Requests
          </h2>
          {isLoading ? (
            <div style={{ padding: '3rem' }}><LoadingSpinner /></div>
          ) : myRequests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              message="Create your first blood request to get matched with nearby donors."
              icon={Droplets}
              action={<Link to="/recipient/create" className="btn btn-primary">Create Request</Link>}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {myRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  actions={
                    req.status === 'pending' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelRequest(req._id)}
                      >
                        Cancel
                      </button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default RecipientDashboard;
