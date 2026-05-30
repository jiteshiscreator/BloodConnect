import { URGENCY_LEVELS } from '../utils/constants';

const UrgencyBadge = ({ urgency }) => {
  const level = URGENCY_LEVELS.find((u) => u.value === urgency) || URGENCY_LEVELS[2];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: level.color,
        background: level.bg,
        border: `1px solid ${level.color}30`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {urgency === 'critical' && <span>🚨</span>}
      {urgency === 'high' && <span>⚠️</span>}
      {level.label}
    </span>
  );
};

export default UrgencyBadge;
