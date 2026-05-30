import { useMemo } from 'react';
import { eligibilityProgress, daysUntilEligible, formatDate } from '../utils/formatters';
import { DONATION_COOLDOWN_DAYS } from '../utils/constants';

/**
 * Circular progress countdown showing days until a donor is eligible again.
 */
const EligibilityCountdown = ({ lastDonated, isEligible, size = 160 }) => {
  const progress = useMemo(() => eligibilityProgress(lastDonated), [lastDonated]);
  const daysLeft = useMemo(() => daysUntilEligible(lastDonated), [lastDonated]);

  const radius = (size / 2) - 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const color = isEligible
    ? '#10b981'
    : daysLeft > 30 ? '#ef4444'
    : daysLeft > 14 ? '#f59e0b'
    : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.125rem',
        }}>
          {isEligible ? (
            <>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>ELIGIBLE</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color, lineHeight: 1 }}>
                {daysLeft}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                days left
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        {isEligible ? (
          <p style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>
            You can donate today!
          </p>
        ) : (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Eligible on {formatDate(new Date(new Date(lastDonated).getTime() + DONATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000))}
          </p>
        )}
        {lastDonated && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Last donated: {formatDate(lastDonated)}
          </p>
        )}
      </div>
    </div>
  );
};

export default EligibilityCountdown;
