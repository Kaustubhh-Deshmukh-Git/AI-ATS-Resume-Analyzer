import { useState } from 'react';
import FileDropzone from '../components/FileDropzone.jsx';

export default function Dashboard() {
  const [parsedResume, setParsedResume] = useState(null);
  const [showTextPreview, setShowTextPreview] = useState(false);

  const handleResumeParsed = (result) => {
    setParsedResume(result);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2>Resume Analyzer</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Upload your resume PDF to extract and verify text content
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Upload Resume PDF</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Our deterministic parser verifies page bounds, extracts selectable text, and prepares it for keyword analysis.
        </p>

        <FileDropzone onParsed={handleResumeParsed} />

        {parsedResume && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(18, 23, 34, 0.7)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
            }}
            id="parsed-resume-details"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--success)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  ✓ Resume Successfully Parsed
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {parsedResume.filename} · {parsedResume.pages} {parsedResume.pages === 1 ? 'page' : 'pages'} ·{' '}
                  {parsedResume.charCount.toLocaleString()} characters
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTextPreview((prev) => !prev)}
                className="btn btn-secondary"
                id="toggle-text-preview-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              >
                {showTextPreview ? 'Hide Extracted Text' : 'View Extracted Text'}
              </button>
            </div>

            {showTextPreview && (
              <pre
                id="extracted-text-preview"
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '1rem',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                }}
              >
                {parsedResume.text}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
