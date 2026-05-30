import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone } from 'lucide-react';
import RoleLayout from '../../layouts/RoleLayout';
import { useGeolocation } from '../../hooks/useGeolocation';
import { bloodbankApi } from '../../api/bloodbank.api';
import toast from 'react-hot-toast';

const CreateBloodBank = () => {
  const [form, setForm] = useState({ name: '', phone: '', address: '', state: '' });
  const { coords } = useGeolocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bloodbankApi.create({
        ...form,
        lat: coords.lat,
        lng: coords.lng
      });
      toast.success('Blood bank registered successfully!');
      window.location.href = '/bloodbank/dashboard'; // Force reload to refresh context
    } catch (err) {
        toast.error('Failed to create blood bank.');
    }
  };

  return (
    <RoleLayout>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Register Blood Bank</h1>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Blood Bank Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input type="tel" className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
          </div>
          <div>
            <label className="label">Street Address / City</label>
            <input className="input" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} required />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Register Facility</button>
        </form>
      </div>
    </RoleLayout>
  );
};
export default CreateBloodBank;