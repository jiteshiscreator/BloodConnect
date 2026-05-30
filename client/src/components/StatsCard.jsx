import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Animated stat widget for role dashboards.
 */
const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'var(--color-blood)', trend, trendValue }) => (
  <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      {Icon && (
        <div style={{
          width: 48, height: 48, borderRadius: '0.75rem',
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={color} />
        </div>
      )}
    </div>

    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {trend === 'up' ? (
          <TrendingUp size={14} color="var(--color-success)" />
        ) : (
          <TrendingDown size={14} color="var(--color-danger)" />
        )}
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)',
        }}>
          {trendValue}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>vs last month</span>
      </div>
    )}
  </div>
);

export default StatsCard;
