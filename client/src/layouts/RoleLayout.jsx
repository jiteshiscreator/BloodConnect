import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationPanel from '../components/NotificationPanel';
import { useNotificationStore } from '../store/useNotificationStore';

/**
 * Main layout shell for all authenticated role dashboards.
 * Renders: Navbar + Sidebar + main content area + NotificationPanel.
 */
const RoleLayout = ({ children }) => {
  const isPanelOpen = useNotificationStore((s) => s.isPanelOpen);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            transition: 'margin-right 0.3s ease',
            marginRight: isPanelOpen ? '360px' : '0',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>

        {/* Notification Slide-over Panel */}
        <NotificationPanel />
      </div>
    </div>
  );
};

export default RoleLayout;
