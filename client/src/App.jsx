import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import ProtectedRoute from './layouts/ProtectedRoute';
import { onForceLogout } from './utils/authEvents';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Donor
import DonorDashboard from './pages/donor/DonorDashboard';
import DonationHistory from './pages/donor/DonationHistory';
import DonorMap from './pages/donor/DonorMap';
import CreateBloodBank from './pages/bloodbank/CreateBloodBank';

// Recipient
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import CreateRequest from './pages/recipient/CreateRequest';
import RecipientMap from './pages/recipient/RecipientMap';

// Hospital
import HospitalDashboard from './pages/hospital/HospitalDashboard';

// Blood Bank
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import InventoryManager from './pages/bloodbank/InventoryManager';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Misc
import NotFound from './pages/NotFound';

/**
 * Socket.IO initializer — renders nothing, just initializes the socket hook.
 */
const SocketInitializer = () => { useSocket(); return null; };

const App = () => {
  const navigate = useNavigate();

  // Listen for forced-logout events dispatched by the axios interceptor
  // when the refresh token expires. Uses a soft navigate() instead of
  // window.location.href so we don't wipe out the SPA state.
  useEffect(() => {
    return onForceLogout(() => navigate('/login', { replace: true }));
  }, [navigate]);
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />

      {/* Socket.IO connection (only for authenticated users, handled inside hook) */}
      <SocketInitializer />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Donor routes ── */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/donor/history" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonationHistory />
          </ProtectedRoute>
        } />
        <Route path="/donor/map" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorMap />
          </ProtectedRoute>
        } />

        {/* ── Recipient routes ── */}
        <Route path="/recipient/dashboard" element={
          <ProtectedRoute allowedRoles={['recipient']}>
            <RecipientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/recipient/create" element={
          <ProtectedRoute allowedRoles={['recipient']}>
            <CreateRequest />
          </ProtectedRoute>
        } />
        <Route path="/recipient/map" element={
          <ProtectedRoute allowedRoles={['recipient']}>
            <RecipientMap />
          </ProtectedRoute>
        } />
        
        {/* ── Hospital routes ── */}
        <Route path="/hospital/dashboard" element={
          <ProtectedRoute allowedRoles={['hospital']}>
            <HospitalDashboard />
          </ProtectedRoute>
        } />
        {/* Redirecting these to the dashboard since they are handled via Tabs internally */}
        <Route path="/hospital/requests" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="/hospital/donors" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="/hospital/map" element={<Navigate to="/hospital/dashboard" replace />} />
        
        {/* ── Blood Bank routes ── */}
        <Route path="/bloodbank/dashboard" element={
          <ProtectedRoute allowedRoles={['bloodbank_admin']}>
            <BloodBankDashboard />
          </ProtectedRoute>
        } />
        <Route path="/bloodbank/inventory" element={
          <ProtectedRoute allowedRoles={['bloodbank_admin']}>
            <InventoryManager />
          </ProtectedRoute>
        } />
        <Route path="/bloodbank/create" element={
          <ProtectedRoute allowedRoles={['bloodbank_admin']}>
            <CreateBloodBank />
          </ProtectedRoute>
        } />
        {/* Redirect donations missing link to dashboard for now */}
        <Route path="/bloodbank/donations" element={<Navigate to="/bloodbank/dashboard" replace />} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
