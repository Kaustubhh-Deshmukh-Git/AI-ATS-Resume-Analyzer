/**
 * Warning banner displayed when Gemini API is unavailable.
 * Informs the candidate that deterministic scoring is 100% valid.
 */
export default function DegradedAiBanner() {
  return (
    <div
      role="alert"
      className="degraded-ai-banner"
      id="degraded-ai-banner"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '1.1rem 1.35rem',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.75rem',
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.25)',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1rem',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        !
      </div>
      <div>
        <h4
          style={{
            margin: '0 0 0.25rem 0',
            color: '#fbbf24',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          AI suggestions unavailable — score still valid
        </h4>
        <p
          style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: '1.5',
          }}
        >
          Our AI service temporarily timed out or encountered rate limits. Your deterministic ATS compatibility score, breakdown metrics, and matched/missing keyword analysis are 100% accurate and fully computed.
        </p>
      </div>
    </div>
  );
}
