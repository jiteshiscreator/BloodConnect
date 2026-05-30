import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Minus, RotateCcw } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import RoleLayout from '../../layouts/RoleLayout';
import BloodTypeBadge from '../../components/BloodTypeBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BLOOD_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const InventoryManager = () => {
  const { myBloodBank, fetchMyBloodBank, updateInventory, isLoading } = useInventoryStore();
  const [editedInventory, setEditedInventory] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const buildFromBank = useCallback((bank) => {
    const init = {};
    BLOOD_TYPES.forEach((bt) => {
      init[bt] = {
        units: bank.inventory?.[bt]?.units || 0,
        expiryDate: bank.inventory?.[bt]?.expiryDate ? bank.inventory[bt].expiryDate.split('T')[0] : '',
      };
    });
    return init;
  }, []);

  useEffect(() => {
    fetchMyBloodBank().then((bank) => {
      if (bank) setEditedInventory(buildFromBank(bank));
    });
  }, [buildFromBank]);

  const adjustUnits = (bt, delta) => {
    setIsDirty(true);
    setEditedInventory((prev) => ({
      ...prev,
      [bt]: { ...prev[bt], units: Math.max(0, (prev[bt]?.units || 0) + delta) },
    }));
  };

  const setUnits = (bt, val) => {
    setIsDirty(true);
    setEditedInventory((prev) => ({
      ...prev,
      [bt]: { ...prev[bt], units: Math.max(0, Number(val) || 0) },
    }));
  };

  const setExpiry = (bt, val) => {
    setIsDirty(true);
    setEditedInventory((prev) => ({
      ...prev,
      [bt]: { ...prev[bt], expiryDate: val },
    }));
  };

  const handleDiscard = () => {
    if (myBloodBank) {
      setEditedInventory(buildFromBank(myBloodBank));
      setIsDirty(false);
      toast('Changes discarded.', { icon: '↩️', style: { background: '#16161f', color: '#fff' } });
    }
  };

  const handleSave = async () => {
    if (!myBloodBank) return;
    setIsSaving(true);
    const updates = BLOOD_TYPES.map((bt) => ({
      bloodType: bt,
      units: editedInventory[bt]?.units || 0,
      expiryDate: editedInventory[bt]?.expiryDate || null,
    }));

    const result = await updateInventory(myBloodBank._id, updates);
    setIsSaving(false);
    if (result.success) {
      setIsDirty(false);
      toast.success('Inventory updated successfully! Live data broadcasted.', {
        style: { background: '#16161f', color: '#fff' },
      });
    } else {
      toast.error(result.error || 'Failed to update inventory');
    }
  };

  if (isLoading) return <RoleLayout><LoadingSpinner /></RoleLayout>;

  return (
    <RoleLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Inventory Manager
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Update stock levels — changes broadcast to platform in real time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isDirty && (
              <button className="btn btn-ghost" onClick={handleDiscard} type="button">
                <RotateCcw size={14} /> Discard Changes
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              <Save size={15} /> {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {BLOOD_TYPES.map((bt) => {
            const current = editedInventory[bt] || { units: 0, expiryDate: '' };
            const units = current.units;
            const level = units === 0 ? 'critical' : units < 5 ? 'low' : units < 15 ? 'moderate' : 'good';
            const levelColor = { critical: '#ef4444', low: '#f59e0b', moderate: '#3b82f6', good: '#10b981' }[level];

            return (
              <div key={bt} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <BloodTypeBadge bloodType={bt} size="lg" />
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: levelColor, background: `${levelColor}15`,
                    padding: '0.2rem 0.625rem', borderRadius: 9999,
                  }}>
                    {level}
                  </span>
                </div>

                {/* Units input */}
                <div>
                  <label className="label">Units in Stock</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button" className="btn btn-ghost btn-sm"
                      style={{ width: 36, height: 36, padding: 0, flexShrink: 0 }}
                      onClick={() => adjustUnits(bt, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number" min={0} max={999}
                      className="input"
                      style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.25rem' }}
                      value={units}
                      onChange={(e) => setUnits(bt, e.target.value)}
                    />
                    <button
                      type="button" className="btn btn-ghost btn-sm"
                      style={{ width: 36, height: 36, padding: 0, flexShrink: 0 }}
                      onClick={() => adjustUnits(bt, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label className="label">Expiry Date</label>
                  <input
                    type="date" className="input"
                    value={current.expiryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setExpiry(bt, e.target.value)}
                  />
                  {myBloodBank?.inventory?.[bt]?.lastUpdated && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Last updated: {formatDate(myBloodBank.inventory[bt].lastUpdated)}
                    </p>
                  )}
                </div>

                {/* Stock bar */}
                <div>
                  <div style={{ height: 6, background: 'var(--color-bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: levelColor,
                      width: `${Math.min(100, (units / 50) * 100)}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </RoleLayout>
  );
};

export default InventoryManager;
