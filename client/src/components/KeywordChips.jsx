import { useState } from 'react';

/**
 * Accessible Keyword Chips component displaying matched and missing ATS taxonomy skills.
 *
 * @param {object} props
 * @param {string[]} props.matched - Array of matched skills
 * @param {string[]} props.missing - Array of missing skills
 */
export default function KeywordChips({ matched = [], missing = [] }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matched' | 'missing'

  const matchedCount = matched.length;
  const missingCount = missing.length;

  return (
    <div className="keyword-chips-section glass-card" style={{ padding: '1.75rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Skills & Keyword Alignment
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Taxonomy terms extracted from the job description and cross-referenced with your resume.
          </p>
        </div>

        {/* Filter switcher buttons */}
        <div
          aria-label="Filter keywords"
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: '0.25rem',
          }}
        >
          <button
            type="button"
            aria-pressed={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            id="tab-keywords-all"
          >
            All ({matchedCount + missingCount})
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'matched'}
            onClick={() => setActiveTab('matched')}
            className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            id="tab-keywords-matched"
          >
            Matched ({matchedCount})
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'missing'}
            onClick={() => setActiveTab('missing')}
            className={`btn ${activeTab === 'missing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            id="tab-keywords-missing"
          >
            Missing ({missingCount})
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Matched Keywords Block */}
        {(activeTab === 'all' || activeTab === 'matched') && (
          <div id="matched-keywords-block">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--success)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)', margin: 0 }}>
                Matched Skills & Technologies ({matchedCount})
              </h4>
            </div>

            {matchedCount === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                No direct keyword matches found. Consider tailoring your resume with core requirements from the job description.
              </p>
            ) : (
              <ul
                className="chip-list"
                aria-label="Matched skills"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {matched.map((skill) => (
                  <li
                    key={skill}
                    className="keyword-chip matched-chip"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.7rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34d399',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Missing Keywords Block */}
        {(activeTab === 'all' || activeTab === 'missing') && (
          <div id="missing-keywords-block">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✕
              </span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171', margin: 0 }}>
                Missing Job Requirements ({missingCount})
              </h4>
            </div>

            {missingCount === 0 ? (
              <p style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                Excellent! All core skills from the job description are present in your resume.
              </p>
            ) : (
              <ul
                className="chip-list"
                aria-label="Missing skills"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {missing.map((skill) => (
                  <li
                    key={skill}
                    className="keyword-chip missing-chip"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.7rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>+</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
