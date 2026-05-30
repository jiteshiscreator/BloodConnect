import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

const NotFound = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--color-bg-base)', textAlign: 'center', padding: '2rem',
  }}>
    <div className="animate-heartbeat" style={{
      width: 80, height: 80, borderRadius: '50%',
      background: 'var(--color-blood-muted)',
      border: '2px solid var(--color-blood)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.5rem',
    }}>
      <Heart size={36} color="var(--color-blood)" />
    </div>
    <h1 className="blood-gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem' }}>
      404
    </h1>
    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
      Page not found
    </p>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: 400 }}>
      The page you're looking for doesn't exist. It may have been moved or deleted.
    </p>
    <Link to="/" className="btn btn-primary btn-lg">
      <Home size={16} /> Go Home
    </Link>
  </div>
);

export default NotFound;
