import { useState } from 'react';

/**
 * Component to compare an original bullet point with its AI-rewritten high-impact version,
 * complete with copy-to-clipboard functionality and accessible screen reader notifications.
 *
 * @param {object} props
 * @param {string} props.original - The original bullet point text
 * @param {string} props.optimized - The AI rewritten bullet point text
 * @param {number} [props.index] - Index for numbering / unique IDs
 */
export default function BulletCompare({ original, optimized, index = 1 }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(optimized);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textarea = document.createElement('textarea');
        textarea.value = optimized;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) {
          throw new Error('execCommand failed');
        }
      }
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  return (
    <div
      className="bullet-compare-card"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
      id={`bullet-compare-${index}`}
    >
      {/* Original Bullet */}
      <div className="bullet-original-section">
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ color: '#ef4444' }}>•</span> Original Resume Bullet
        </div>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid rgba(239, 68, 68, 0.4)',
            margin: 0,
          }}
        >
          {original}
        </p>
      </div>

      {/* Optimized Bullet */}
      <div className="bullet-optimized-section">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.35rem',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>✓</span> AI High-Impact Rewrite
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`btn ${copied ? 'btn-primary' : copyError ? 'btn-danger' : 'btn-secondary'}`}
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              minWidth: '90px',
            }}
            aria-label={`Copy optimized bullet ${index} to clipboard`}
            id={`copy-bullet-btn-${index}`}
          >
            {copied ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                ✓ Copied!
              </span>
            ) : copyError ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
                ⚠️ Failed
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                📋 Copy
              </span>
            )}
          </button>
        </div>

        <p
          style={{
            color: 'var(--text-primary)',
            fontSize: '0.925rem',
            lineHeight: '1.5',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '0.75rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--success)',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {optimized}
        </p>
      </div>

      {/* Screen reader live notification */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id={`copy-bullet-status-${index}`}
      >
        {copied && `Optimized bullet point ${index} copied to clipboard.`}
        {copyError && `Failed to copy bullet point ${index}.`}
      </div>
    </div>
  );
}
