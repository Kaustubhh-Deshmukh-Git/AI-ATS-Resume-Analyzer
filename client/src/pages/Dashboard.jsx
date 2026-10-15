import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2>Your Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage past ATS scans and optimize new resumes
          </p>
        </div>
        <Link to="/" className="btn btn-primary" id="new-scan-btn">
          + New Resume Scan
        </Link>
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
        <h3 style={{ marginBottom: '0.5rem' }}>No Analyses Yet</h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            maxWidth: '450px',
            margin: '0 auto 1.5rem',
            fontSize: '0.95rem',
          }}
        >
          Upload your resume in PDF format and target job description to see your first
          compatibility score and keyword suggestions.
        </p>
        <Link to="/" className="btn btn-secondary">
          Run First Scan
        </Link>
      </div>
    </div>
  );
}
