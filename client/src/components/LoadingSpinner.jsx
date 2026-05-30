const LoadingSpinner = ({ size = 'md', color = 'var(--color-blood)' }) => {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={s} height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spin"
      >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
