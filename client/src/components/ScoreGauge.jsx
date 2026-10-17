/**
 * Accessible, animated SVG circular Score Gauge for ATS compatibility.
 *
 * @param {object} props
 * @param {number} props.score - Overall ATS score (0–100)
 * @param {string} [props.size='180px'] - Diameter of gauge
 * @param {boolean} [props.showLabel=true] - Whether to show match status label
 */
export default function ScoreGauge({ score = 0, size = '180px', showLabel = true }) {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine tier and colors
  let tier = 'Needs Optimization';
  let tierColor = '#ef4444'; // Red
  let gradientId = 'gauge-low';

  if (boundedScore >= 75) {
    tier = 'Strong Match';
    tierColor = '#10b981'; // Green
    gradientId = 'gauge-high';
  } else if (boundedScore >= 50) {
    tier = 'Moderate Match';
    tierColor = '#f59e0b'; // Amber
    gradientId = 'gauge-mid';
  }

  // SVG Geometry
  const strokeWidth = 12;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  return (
    <div
      className="score-gauge-container"
      role="meter"
      aria-valuenow={boundedScore}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Overall ATS Score: ${boundedScore} out of 100 (${tier})`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
      }}
    >
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
        <svg
          viewBox="0 0 160 160"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gauge-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-mid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gauge-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Animated Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center Text Content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            id="score-gauge-number"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {boundedScore}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '0.2rem',
            }}
          >
            ATS Score
          </span>
        </div>
      </div>

      {showLabel && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: `${tierColor}15`,
            border: `1px solid ${tierColor}40`,
            color: tierColor,
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
          }}
          id="score-gauge-tier"
        >
          {tier}
        </div>
      )}
    </div>
  );
}
