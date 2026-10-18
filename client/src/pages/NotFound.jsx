import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="glass-card"
      style={{
        maxWidth: '560px',
        margin: '4rem auto',
        textAlign: 'center',
        padding: '3rem 2rem',
      }}
      id="not-found-card"
    >
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 900,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '1rem',
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary" id="not-found-home-btn">
          Go Home
        </Link>
        <Link to="/dashboard" className="btn btn-secondary" id="not-found-dashboard-btn">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
