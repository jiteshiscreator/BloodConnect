import { BLOOD_TYPE_COLORS, BLOOD_TYPES } from '../utils/constants';

/**
 * Visual blood type stock level bar for blood bank dashboards.
 */
const InventoryBar = ({ inventory, compact = false }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
      {BLOOD_TYPES.map((bt) => {
        const stock = inventory?.[bt]?.units || 0;
        const colors = BLOOD_TYPE_COLORS[bt];
        const maxUnits = 50; // Display cap
        const percent = Math.min(100, (stock / maxUnits) * 100);
        const level = percent === 0 ? 'critical' : percent < 30 ? 'low' : percent < 60 ? 'moderate' : 'good';
        const levelColor = level === 'critical' ? '#ef4444' : level === 'low' ? '#f59e0b' : level === 'moderate' ? '#3b82f6' : '#10b981';

        return (
          <div key={bt} style={{
            background: 'var(--color-bg-elevated)',
            border: `1px solid ${stock === 0 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
            borderRadius: '0.75rem',
            padding: compact ? '0.625rem' : '0.875rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors?.color, fontFamily: 'var(--font-display)' }}>
                {bt}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {stock}
                {!compact && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 2 }}>units</span>}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--color-bg-base)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${percent}%`,
                background: levelColor,
                borderRadius: 3,
                transition: 'width 0.5s ease',
                boxShadow: percent > 0 ? `0 0 6px ${levelColor}60` : 'none',
              }} />
            </div>

            {!compact && (
              <span style={{ fontSize: '0.6875rem', color: levelColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {level === 'critical' ? '🔴 Out of stock' : level === 'low' ? '🟡 Low' : level === 'moderate' ? '🔵 Moderate' : '🟢 Good'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InventoryBar;
