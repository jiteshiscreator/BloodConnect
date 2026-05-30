import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, Phone, Droplets, Building2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { BLOOD_TYPES, ROLE_DASHBOARD_PATHS } from '../../utils/constants';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Role & Type', 'Location'];

const ROLES = [
  { value: 'donor', label: '🩸 Blood Donor', desc: 'Respond to emergency requests' },
  { value: 'recipient', label: '🏥 Patient / Recipient', desc: 'Request blood when needed' },
  { value: 'hospital', label: '🏨 Hospital Staff', desc: 'Manage transfusion requests' },
  { value: 'bloodbank_admin', label: '🔬 Blood Bank Admin', desc: 'Manage inventory & stock' },
];

const Register = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: '', bloodType: '', hospitalName: '', city: 'Hyderabad',
  });
  const [errors, setErrors] = useState({});
  const { register, isLoading, isAuthenticated, user } = useAuthStore();
  const { coords } = useGeolocation();
  const navigate = useNavigate();

  // Already signed in — redirect to their dashboard immediately
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DASHBOARD_PATHS[user.role] || '/'} replace />;
  }

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
      if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    }
    if (step === 1) {
      if (!form.role) errs.role = 'Please select a role';
      if (['donor', 'recipient'].includes(form.role) && !form.bloodType) errs.bloodType = 'Blood type required';
      if (form.role === 'hospital' && !form.hospitalName) errs.hospitalName = 'Hospital name required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const payload = { ...form, lat: coords.lat, lng: coords.lng };
    const result = await register(payload);

    if (result.success) {
      toast.success('Account created! Welcome to BloodConnect 🩸', { style: { background: '#16161f', color: '#fff' }, duration: 4000 });
      navigate(ROLE_DASHBOARD_PATHS[result.user.role] || '/');
    } else {
      const msg = result.error || 'Registration failed';
      toast.error(msg, { style: { background: '#16161f', color: '#fff' } });
      if (result.errors?.length) {
        const fieldErrors = {};
        result.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    }
  };

  const inputProps = (field, type = 'text', placeholder = '') => ({
    id: field, type, name: field, className: `input${errors[field] ? ' input-error' : ''}`,
    value: form[field], placeholder,
    onChange: (e) => { set(field, e.target.value); setErrors((prev) => ({ ...prev, [field]: '' })); },
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-base)', padding: '1.5rem',
    }}>
      <div style={{
        position: 'fixed', top: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,20,60,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div className="animate-heartbeat" style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-blood-dark), var(--color-blood))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px var(--color-blood-glow)',
            }}>
              <Heart size={20} color="#fff" fill="#fff" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
              Blood<span className="blood-gradient-text">Connect</span>
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Create your account</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: i <= step ? 'var(--color-blood)' : 'var(--color-bg-elevated)',
                transition: 'background 0.3s',
              }} />
              <span style={{ fontSize: '0.6875rem', color: i <= step ? 'var(--color-blood-light)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); next(); }}>
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input {...inputProps('name', 'text', 'Arjun Sharma')} style={{ paddingLeft: 38 }} />
                  </div>
                  {errors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input {...inputProps('email', 'email', 'arjun@example.com')} style={{ paddingLeft: 38 }} />
                  </div>
                  {errors.email && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input {...inputProps('password', 'password', 'Min 6 characters')} style={{ paddingLeft: 38 }} />
                  </div>
                  {errors.password && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="phone">Phone (optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input {...inputProps('phone', 'tel', '+91 98765 43210')} style={{ paddingLeft: 38 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Role & Blood Type */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label">Select Your Role</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ROLES.map((role) => (
                      <div
                        key={role.value}
                        onClick={() => { set('role', role.value); setErrors((p) => ({ ...p, role: '' })); }}
                        style={{
                          padding: '0.75rem 1rem', borderRadius: '0.625rem', cursor: 'pointer',
                          border: `1px solid ${form.role === role.value ? 'var(--color-blood)' : 'var(--color-border)'}`,
                          background: form.role === role.value ? 'var(--color-blood-muted)' : 'var(--color-bg-elevated)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{role.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{role.desc}</div>
                      </div>
                    ))}
                  </div>
                  {errors.role && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.role}</p>}
                </div>

                {['donor', 'recipient'].includes(form.role) && (
                  <div>
                    <label className="label">Blood Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {BLOOD_TYPES.map((bt) => (
                        <button
                          key={bt} type="button"
                          onClick={() => { set('bloodType', bt); setErrors((p) => ({ ...p, bloodType: '' })); }}
                          style={{
                            padding: '0.625rem', borderRadius: '0.5rem', cursor: 'pointer',
                            border: `1px solid ${form.bloodType === bt ? 'var(--color-blood)' : 'var(--color-border)'}`,
                            background: form.bloodType === bt ? 'var(--color-blood)' : 'var(--color-bg-elevated)',
                            color: form.bloodType === bt ? '#fff' : 'var(--color-text-primary)',
                            fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                    {errors.bloodType && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.bloodType}</p>}
                  </div>
                )}

                {form.role === 'hospital' && (
                  <div>
                    <label className="label" htmlFor="hospitalName">Hospital Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input {...inputProps('hospitalName', 'text', 'AIIMS Hyderabad')} style={{ paddingLeft: 38 }} />
                    </div>
                    {errors.hospitalName && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.hospitalName}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label" htmlFor="city">City</label>
                  <input {...inputProps('city', 'text', 'Hyderabad')} />
                </div>

                <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    📍 Your Location
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Lat: {coords.lat.toFixed(4)} · Lng: {coords.lng.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                    This will be used for geo-matching nearby donors and blood banks.
                  </div>
                </div>

                <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(220,20,60,0.05)', border: '1px solid rgba(220,20,60,0.2)' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-blood-light)' }}>
                    By creating an account, you agree to use this platform solely for genuine blood donation purposes.
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {step > 0 && (
                <button type="button" onClick={back} className="btn btn-ghost" style={{ flex: 1 }}>
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={isLoading}
              >
                {step < STEPS.length - 1 ? (
                  <><span>Continue</span><ChevronRight size={16} /></>
                ) : isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-blood-light)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
