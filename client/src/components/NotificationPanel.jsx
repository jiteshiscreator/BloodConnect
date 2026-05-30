import { useEffect } from 'react';
import { X, Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { timeAgo } from '../utils/formatters';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const priorityColors = {
  urgent: '#DC143C',
  high: '#FF4D6D',
  medium: '#3b82f6',
  low: '#9898b8',
};

const typeIcons = {
  emergency_alert: '🚨',
  eligibility_reminder: '⏰',
  request_update: '📋',
  donation_confirmed: '🩸',
  system: '🔔',
};

const NotificationPanel = () => {
  const { notifications, unreadCount, isPanelOpen, isLoading, closePanel, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

  useEffect(() => {
    if (isPanelOpen) fetchNotifications();
  }, [isPanelOpen]);

  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          onClick={closePanel}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Panel */}
      <aside style={{
        position: 'fixed', top: 64, right: 0, bottom: 0,
        width: '360px',
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border)',
        zIndex: 45,
        display: 'flex', flexDirection: 'column',
        transform: isPanelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isPanelOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--color-blood-light)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--color-blood)', color: '#fff',
                fontSize: '0.6875rem', fontWeight: 700,
                borderRadius: '9999px', padding: '0.1rem 0.4rem',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} title="Mark all read" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 4,
                display: 'flex', borderRadius: 6,
                transition: 'color 0.2s',
              }}>
                <CheckCheck size={16} />
              </button>
            )}
            <button onClick={closePanel} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: 4,
              display: 'flex', borderRadius: 6,
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {isLoading ? (
            <div style={{ padding: '2rem' }}><LoadingSpinner /></div>
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" message="You're all caught up!" icon={Bell} />
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                style={{
                  padding: '0.875rem',
                  borderRadius: '0.625rem',
                  marginBottom: '0.25rem',
                  background: n.isRead ? 'transparent' : 'rgba(220,20,60,0.05)',
                  border: `1px solid ${n.isRead ? 'transparent' : 'rgba(220,20,60,0.15)'}`,
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${priorityColors[n.priority] || '#3b82f6'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    {typeIcons[n.type] || '🔔'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: 'var(--color-text-primary)', marginBottom: '0.2rem',
                    }}>
                      {n.title}
                      {!n.isRead && (
                        <span style={{
                          display: 'inline-block', width: 6, height: 6,
                          background: 'var(--color-blood)', borderRadius: '50%',
                          marginLeft: 6, verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, flexShrink: 0, opacity: 0.6 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default NotificationPanel;
