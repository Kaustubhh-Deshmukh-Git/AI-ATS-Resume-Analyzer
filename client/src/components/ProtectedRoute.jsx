import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard component that protects private views.
 * Redirects unauthenticated visitors to /login preserving the return path.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, sessionError, retrySessionCheck } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
        }}
      >
        <span className="spinner" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Verifying session...</p>
      </div>
    );
  }

  if (sessionError && !user) {
    return (
      <div
        role="alert"
        className="glass-card"
        style={{ maxWidth: '420px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Session Verification Failed</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {sessionError}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => retrySessionCheck && retrySessionCheck()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
