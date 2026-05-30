import { BLOOD_TYPE_COLORS } from '../utils/constants';

/**
 * Styled blood type badge pill.
 */
const BloodTypeBadge = ({ bloodType, size = 'sm' }) => {
  const colors = BLOOD_TYPE_COLORS[bloodType] || { color: '#9898b8', bg: 'rgba(152,152,184,0.12)' };
  const fontSize = size === 'lg' ? '0.9375rem' : size === 'md' ? '0.8125rem' : '0.75rem';
  const padding = size === 'lg' ? '0.375rem 0.875rem' : '0.2rem 0.5rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        color: colors.color,
        background: colors.bg,
        border: `1px solid ${colors.color}30`,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {bloodType || '—'}
    </span>
  );
};

export default BloodTypeBadge;
