import { MapPin, Clock, User } from 'lucide-react';
import BloodTypeBadge from './BloodTypeBadge';
import UrgencyBadge from './UrgencyBadge';
import { timeAgo } from '../utils/formatters';
import { REQUEST_STATUSES } from '../utils/constants';

const RequestCard = ({ request, actions }) => {
  const statusInfo = REQUEST_STATUSES.find((s) => s.value === request.status) || REQUEST_STATUSES[0];

  return (
    <div className="card card-hover animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <BloodTypeBadge bloodType={request.bloodType} size="md" />
          <UrgencyBadge urgency={request.urgency} />
        </div>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600,
          color: statusInfo.color,
          background: `${statusInfo.color}18`,
          padding: '0.2rem 0.625rem',
          borderRadius: '9999px',
          border: `1px solid ${statusInfo.color}30`,
          textTransform: 'capitalize',
          whiteSpace: 'nowrap',
        }}>
          {statusInfo.label}
        </span>
      </div>

      {/* Patient Info */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
          {request.patientName}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {request.units} unit{request.units > 1 ? 's' : ''} required
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {request.hospital?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={13} />
            <span>{request.hospital.name}</span>
            {request.hospital.address && <span>· {request.hospital.address}</span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <Clock size={13} />
          <span>{timeAgo(request.createdAt)}</span>
        </div>
        {request.requestedBy?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <User size={13} />
            <span>By {request.requestedBy.name}</span>
          </div>
        )}
      </div>

      {/* Actions slot */}
      {actions && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.875rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default RequestCard;
