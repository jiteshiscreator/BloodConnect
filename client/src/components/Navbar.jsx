import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { ROLE_LABELS } from '../utils/constants';
import BloodTypeBadge from './BloodTypeBadge';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, togglePanel } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="glass-strong" style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--color-border)',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
        <div className="animate-heartbeat" style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-blood)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px var(--color-blood-glow)',
        }}>
          <Heart size={18} color="#fff" fill="#fff" />
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
            Blood
          </span>
          <span className="blood-gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
            Connect
          </span>
        </div>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notification Bell */}
        <button
          onClick={togglePanel}
          style={{
            position: 'relative',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.625rem',
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-text-secondary)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.color = 'var(--color-blood-light)'; e.target.style.borderColor = 'var(--color-blood)'; }}
          onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-secondary)'; e.target.style.borderColor = 'var(--color-border)'; }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="animate-pulse-blood" style={{
              position: 'absolute', top: -4, right: -4,
              background: 'var(--color-blood)', color: '#fff',
              fontSize: '0.625rem', fontWeight: 700,
              borderRadius: '9999px', minWidth: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
          borderRadius: '0.625rem', padding: '0.375rem 0.75rem',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--color-blood-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={14} color="var(--color-blood-light)" />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              {ROLE_LABELS[user?.role]}
            </div>
          </div>
          {user?.bloodType && <BloodTypeBadge bloodType={user.bloodType} />}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ gap: '0.375rem' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
