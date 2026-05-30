import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Wraps a route to require authentication.
 * Optionally restrict to specific roles.
 * @param {string[]} allowedRoles - If empty, any authenticated user is allowed.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const [isChecking, setIsChecking] = useState(!isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchMe().finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, []);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg-base)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const dashboardPaths = {
      donor: '/donor/dashboard',
      recipient: '/recipient/dashboard',
      hospital: '/hospital/dashboard',
      bloodbank_admin: '/bloodbank/dashboard',
      super_admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
