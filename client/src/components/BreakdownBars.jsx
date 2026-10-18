/**
 * Breakdown Bars component displaying the 4 weighted ATS scoring categories:
 * - Keyword Match (60%)
 * - Section Completeness (20%)
 * - Formatting & Readability (10%)
 * - Impact & Quantifiable Metrics (10%)
 *
 * @param {object} props
 * @param {object} props.breakdown - Breakdown points object { keyword, sections, readability, impact }
 */
export default function BreakdownBars({ breakdown = {} }) {
  const rawKeyword = breakdown.keyword ?? 0;
  const rawSections = breakdown.sections ?? 0;
  const rawReadability = breakdown.readability ?? 0;
  const rawImpact = breakdown.impact ?? 0;

  const categories = [
    {
      key: 'keyword',
      label: 'Keyword Match',
      weight: '60%',
      max: 60,
      value: rawKeyword * 0.6,
      description: 'Taxonomy skills, languages, and technical keywords aligned with the job description',
      color: '#6366f1',
    },
    {
      key: 'sections',
      label: 'Section Structure',
      weight: '20%',
      max: 20,
      value: rawSections * 0.2,
      description: 'Standard resume headings (Experience, Education, Skills, Projects, Summary)',
      color: '#3b82f6',
    },
    {
      key: 'readability',
      label: 'Readability & Layout',
      weight: '10%',
      max: 10,
      value: rawReadability * 0.1,
      description: 'Concise phrasing, active voice, sentence length, and parse clarity',
      color: '#10b981',
    },
    {
      key: 'impact',
      label: 'Impact & Metrics',
      weight: '10%',
      max: 10,
      value: rawImpact * 0.1,
      description: 'Measurable achievements, numbers, percentages, and strong action verbs',
      color: '#a855f7',
    },
  ];

  return (
    <div className="breakdown-bars-container" style={{ width: '100%' }}>
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>Score Breakdown</span>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          (Weighted Deterministic Analysis)
        </span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {categories.map((cat) => {
          const percentage = cat.max > 0 ? Math.min(100, (cat.value / cat.max) * 100) : 0;
          const displayValue = Math.round(cat.value * 10) / 10;

          return (
            <div key={cat.key} className="breakdown-item" id={`breakdown-${cat.key}`}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.35rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginLeft: '0.5rem',
                    }}
                  >
                    Weight: {cat.weight}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{displayValue}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {cat.max} pts</span>
                </div>
              </div>

              {/* Accessible Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={Math.round(cat.value)}
                aria-valuemin="0"
                aria-valuemax={cat.max}
                aria-label={`${cat.label}: ${displayValue} out of ${cat.max} points`}
                style={{
                  height: '8px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.3rem',
                }}
              >
                {cat.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
