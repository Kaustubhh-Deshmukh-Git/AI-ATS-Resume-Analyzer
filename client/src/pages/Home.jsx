import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '9999px',
          color: 'var(--accent-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}
      >
        <span>⚡ Powered by Gemini 2.5 Flash & Deterministic ATS Scoring</span>
      </div>

      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          maxWidth: '850px',
          margin: '0 auto 1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Optimize Your Resume for{' '}
        <span
          style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ATS Algorithms
        </span>
      </h1>

      <p
        style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 auto 2.5rem',
        }}
      >
        Upload your resume, target your dream job description, and get instant, explainable keyword
        matches, scoring breakdowns, and AI optimizations.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/register" className="btn btn-primary" id="home-get-started-btn">
          Get Started Free
        </Link>
        <Link to="/login" className="btn btn-secondary" id="home-login-btn">
          Sign In
        </Link>
      </div>
    </div>
  );
}
