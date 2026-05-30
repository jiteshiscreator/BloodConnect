import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Nothing here yet', message = '', icon: Icon = Inbox, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '1rem', padding: '3rem',
    color: 'var(--color-text-muted)', textAlign: 'center',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      background: 'var(--color-bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={28} color="var(--color-text-muted)" />
    </div>
    <div>
      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>{title}</div>
      {message && <div style={{ fontSize: '0.875rem' }}>{message}</div>}
    </div>
    {action}
  </div>
);

export default EmptyState;
