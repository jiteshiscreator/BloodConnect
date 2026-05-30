import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, History, PlusCircle, Search,
  Building2, FlaskConical, Users, BarChart3, Bell, MapPin,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const navConfigs = {
  donor: [
    { to: '/donor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/donor/history', icon: History, label: 'Donation History' },
    { to: '/donor/map', icon: MapPin, label: 'Nearby Requests' },
  ],
  recipient: [
    { to: '/recipient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recipient/create', icon: PlusCircle, label: 'New Request' },
    { to: '/recipient/map', icon: MapPin, label: 'Nearby Blood Banks' },
  ],
  hospital: [
    { to: '/hospital/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
  ],
  bloodbank_admin: [
    { to: '/bloodbank/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/bloodbank/inventory', icon: FlaskConical, label: 'Inventory Manager' }
  ],
  super_admin: [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/requests', icon: Droplets, label: 'Requests' },
    { to: '/admin/bloodbanks', icon: Building2, label: 'Blood Banks' },
  ],
};

const Sidebar = () => {
  const { user } = useAuthStore();
  const links = navConfigs[user?.role] || [];

  return (
    <aside style={{
      width: '220px',
      minHeight: 'calc(100vh - 64px)',
      background: 'var(--color-bg-surface)',
      borderRight: '1px solid var(--color-border)',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      flexShrink: 0,
    }}>
      {/* Role indicator */}
      <div style={{
        padding: '0.625rem 0.75rem',
        marginBottom: '0.75rem',
        borderRadius: '0.625rem',
        background: 'var(--color-blood-muted)',
        border: '1px solid rgba(220,20,60,0.2)',
      }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-blood-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Signed in as
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>
          {user?.name}
        </div>
      </div>

      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <Icon size={16} style={{ flexShrink: 0 }} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
