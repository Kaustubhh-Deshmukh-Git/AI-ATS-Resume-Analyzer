import BulletCompare from './BulletCompare.jsx';
import DegradedAiBanner from './DegradedAiBanner.jsx';

/**
 * Renders AI-powered suggestions from Gemini:
 * - Missing skills
 * - Improvement tips
 * - High-impact bullet rewrites with copy action
 *
 * @param {object} props
 * @param {string} [props.aiStatus='ok'] - 'ok' | 'unavailable'
 * @param {object|null} props.ai - The AI payload { missingSkills, tips, bulletRewrites }
 */
export default function AiSuggestions({ aiStatus = 'ok', ai = null }) {
  if (aiStatus === 'unavailable' || !ai) {
    return <DegradedAiBanner />;
  }

  const missingSkills = ai.missingSkills || [];
  const tips = ai.optimizationTips || ai.tips || [];
  const rewrites = ai.bulletImprovements || ai.bulletRewrites || [];

  return (
    <div className="ai-suggestions-section glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.35rem',
              fontWeight: 800,
            }}
          >
            ✦
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            Gemini AI Optimization Analysis
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Targeted suggestions generated specifically for this job description to maximize ATS pass-through and recruiter impact.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* 1. Missing Technical & Soft Skills */}
        {missingSkills.length > 0 && (
          <div id="ai-missing-skills-section">
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🎯</span> Missing Target Skills Identified by AI
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#818cf8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Tactical Optimization Tips */}
        {tips.length > 0 && (
          <div id="ai-optimization-tips-section">
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>💡</span> Key Recommendations & Actionable Improvements
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      width: '1.4rem',
                      height: '1.4rem',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '0.1rem',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                    }}
                  >
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. High-Impact Bullet Rewrites */}
        {rewrites.length > 0 && (
          <div id="ai-bullet-rewrites-section">
            <div style={{ marginBottom: '1rem' }}>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>⚡</span> High-Impact Bullet Point Rewrites
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Compare your original resume bullet points against enhanced versions with measurable metrics and active verbs.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rewrites.map((rewrite, idx) => (
                <BulletCompare
                  key={idx}
                  index={idx + 1}
                  original={rewrite.original}
                  optimized={rewrite.improved ?? rewrite.optimized}
                  reason={rewrite.reason}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
