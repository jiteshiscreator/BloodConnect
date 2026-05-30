import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Droplets, AlertTriangle, FileText } from 'lucide-react';
import { useRequestStore } from '../../store/useRequestStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthStore } from '../../store/useAuthStore';
import RoleLayout from '../../layouts/RoleLayout';
import { BLOOD_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const URGENCIES = [
  { value: 'critical', label: '🚨 Critical', desc: 'Life threatening — immediate response needed', color: '#ef4444' },
  { value: 'high', label: '⚠️ High', desc: 'Urgent — needed within a few hours', color: '#FF4D6D' },
  { value: 'normal', label: '✅ Normal', desc: 'Planned — within 24 hours', color: '#10b981' },
];

/**
 * SectionHeader — defined at MODULE scope, not inside CreateRequest.
 * Defining it inside the component causes React to unmount+remount it
 * on every keystroke (new function reference = new component type),
 * destroying DOM nodes and losing input focus states.
 */
const SectionHeader = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--color-border)' }}>
    <Icon size={16} color="var(--color-blood-light)" />
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{title}</h3>
  </div>
);

const CreateRequest = () => {
  const [form, setForm] = useState({
    patientName: '', bloodType: '', units: 1, urgency: 'normal',
    hospitalName: '', hospitalAddress: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const { createRequest, isLoading } = useRequestStore();
  const { user } = useAuthStore();
  const { coords } = useGeolocation();
  const navigate = useNavigate();

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setErrors((e) => ({ ...e, [field]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.patientName.trim()) errs.patientName = 'Patient name required';
    if (!form.bloodType) errs.bloodType = 'Blood type required';
    if (!form.units || form.units < 1) errs.units = 'Minimum 1 unit';
    if (!form.urgency) errs.urgency = 'Urgency level required';
    if (!form.hospitalName.trim()) errs.hospitalName = 'Hospital name required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      patientName: form.patientName,
      bloodType: form.bloodType,
      units: Number(form.units),
      urgency: form.urgency,
      hospital: { name: form.hospitalName, address: form.hospitalAddress },
      notes: form.notes,
      city: user?.city || 'Hyderabad',
      lat: coords.lat,
      lng: coords.lng,
    };

    const result = await createRequest(payload);
    if (result.success) {
      toast.success('🩸 Blood request created! Notifying nearby donors...', {
        duration: 5000,
        style: { background: '#16161f', color: '#fff' },
      });
      navigate('/recipient/dashboard');
    } else {
      toast.error(result.error || 'Failed to create request', { style: { background: '#16161f', color: '#fff' } });
    }
  };

  return (
    <RoleLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            New Blood Request
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Nearby donors matching the blood type will be notified instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Patient details */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader icon={Droplets} title="Patient Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label" htmlFor="patientName">Patient Name</label>
                <input id="patientName" className={`input${errors.patientName ? ' input-error' : ''}`}
                  value={form.patientName} onChange={(e) => set('patientName', e.target.value)}
                  placeholder="Full name of patient" />
                {errors.patientName && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.patientName}</p>}
              </div>

              {/* Blood Type */}
              <div>
                <label className="label">Blood Type Required</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {BLOOD_TYPES.map((bt) => (
                    <button key={bt} type="button" onClick={() => set('bloodType', bt)}
                      style={{
                        padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
                        border: `1px solid ${form.bloodType === bt ? 'var(--color-blood)' : 'var(--color-border)'}`,
                        background: form.bloodType === bt ? 'var(--color-blood)' : 'var(--color-bg-elevated)',
                        color: form.bloodType === bt ? '#fff' : 'var(--color-text-primary)',
                        fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s',
                      }}>{bt}</button>
                  ))}
                </div>
                {errors.bloodType && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.bloodType}</p>}
              </div>

              {/* Units */}
              <div>
                <label className="label" htmlFor="units">Units Required</label>
                <input id="units" type="number" min={1} max={20} className={`input${errors.units ? ' input-error' : ''}`}
                  value={form.units} onChange={(e) => set('units', e.target.value)} />
                {errors.units && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.units}</p>}
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader icon={AlertTriangle} title="Urgency Level" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {URGENCIES.map((u) => (
                <div key={u.value} onClick={() => set('urgency', u.value)}
                  style={{
                    padding: '0.875rem 1rem', borderRadius: '0.625rem', cursor: 'pointer',
                    border: `1px solid ${form.urgency === u.value ? u.color : 'var(--color-border)'}`,
                    background: form.urgency === u.value ? `${u.color}12` : 'var(--color-bg-elevated)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{u.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{u.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader icon={MapPin} title="Hospital Location" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="hospitalName">Hospital Name</label>
                <input id="hospitalName" className={`input${errors.hospitalName ? ' input-error' : ''}`}
                  value={form.hospitalName} onChange={(e) => set('hospitalName', e.target.value)}
                  placeholder="e.g. AIIMS Hyderabad" />
                {errors.hospitalName && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.hospitalName}</p>}
              </div>
              <div>
                <label className="label" htmlFor="hospitalAddress">Address (optional)</label>
                <input id="hospitalAddress" className="input" value={form.hospitalAddress}
                  onChange={(e) => set('hospitalAddress', e.target.value)}
                  placeholder="Street, area, landmark" />
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                📍 Using your current location: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader icon={FileText} title="Additional Notes" />
            <textarea id="notes" className="input" rows={3}
              style={{ resize: 'vertical', minHeight: 80 }}
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Any additional information (medical condition, time constraints, etc.)" />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? 'Sending Alert...' : '🚨 Submit Request & Alert Donors'}
            </button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
};

export default CreateRequest;
