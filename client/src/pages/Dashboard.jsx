import { useState } from 'react';
import { Link } from 'react-router-dom';
import FileDropzone from '../components/FileDropzone.jsx';
import JdTextarea from '../components/JdTextarea.jsx';
import ScoreGauge from '../components/ScoreGauge.jsx';
import BreakdownBars from '../components/BreakdownBars.jsx';
import KeywordChips from '../components/KeywordChips.jsx';
import AiSuggestions from '../components/AiSuggestions.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAnalysis } from '../hooks/useAnalysis.js';

export default function Dashboard() {
  const [parsedResume, setParsedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [title, setTitle] = useState('');
  const [isDropzoneParsing, setIsDropzoneParsing] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const { isLoading, error: apiError, result: analysisResult, analyze, reset } = useAnalysis();

  const handleResumeParsed = (result) => {
    setParsedResume(result);
    setFormError(null);
    setIsDropzoneParsing(false);
  };

  const handleParsingStatus = (parsing) => {
    setIsDropzoneParsing(parsing);
  };

  // Boundary checks for Job Description
  const jdCharCount = jobDescription.trim().length;
  const isJdValid = jdCharCount >= 50 && jdCharCount <= 10000;
  const isReadyToAnalyze = Boolean(parsedResume?.text) && isJdValid && !isLoading && !isDropzoneParsing;

  const handleAnalyzeSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!parsedResume?.text) {
      setFormError('Please upload and extract a valid PDF resume before analyzing.');
      return;
    }

    if (jdCharCount < 50) {
      setFormError('Job description must be at least 50 characters to perform accurate keyword matching.');
      return;
    }

    if (jdCharCount > 10000) {
      setFormError('Job description exceeds maximum allowable limit of 10,000 characters.');
      return;
    }

    try {
      await analyze({
        resumeText: parsedResume.text,
        jobDescription,
        title: title.trim() || undefined,
      });
    } catch {
      // Error is tracked in hook (apiError)
    }
  };

  const handleStartNewAnalysis = () => {
    reset();
    setParsedResume(null);
    setJobDescription('');
    setTitle('');
    setFormError(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Resume Analyzer</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Compare your resume against target job requirements for ATS keyword alignment and AI optimization.
          </p>
        </div>

        <Link
          to="/history"
          className="btn btn-secondary"
          id="view-history-btn"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          📂 View Analysis History
        </Link>
      </div>

      {/* Global Form/API Error Banner */}
      {(formError || apiError) && (
        <div
          role="alert"
          className="alert-error"
          id="dashboard-error-banner"
          style={{ marginBottom: '1.5rem' }}
        >
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>!</span>
          <div>
            <strong>Error: </strong>
            <span>{formError || apiError?.message || 'Failed to analyze resume. Please try again.'}</span>
          </div>
        </div>
      )}

      {/* If Analysis is done, show the Results View */}
      {analysisResult ? (
        <div id="analysis-results-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Results Summary Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Analysis Complete
                </span>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                  {analysisResult.title || 'ATS Compatibility Analysis'}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/analyses/${analysisResult.id}`}
                  className="btn btn-secondary"
                  id="permalink-report-btn"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                >
                  🔗 Direct Report Link
                </Link>
                <button
                  type="button"
                  onClick={handleStartNewAnalysis}
                  className="btn btn-primary"
                  id="new-analysis-btn"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  + Analyze Another Resume
                </button>
              </div>
            </div>

            {/* Score & Breakdown Dual Column Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                }}
              >
                <ScoreGauge score={analysisResult.score} size="190px" />
              </div>

              <div>
                <BreakdownBars breakdown={analysisResult.breakdown} />
              </div>
            </div>
          </div>

          {/* Keyword Chips */}
          <KeywordChips
            matched={analysisResult.matched}
            missing={analysisResult.missing}
          />

          {/* AI Suggestions & Bullet Rewrites */}
          <AiSuggestions
            aiStatus={analysisResult.aiStatus}
            ai={analysisResult.ai}
          />
        </div>
      ) : (
        /* Input & Submission Form */
        <form onSubmit={handleAnalyzeSubmit} noValidate id="analysis-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1: Resume Upload */}
            <div className="glass-card">
              <div style={{ marginBottom: '1.25rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    color: 'var(--accent-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Step 1
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Upload Resume (PDF)</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  Upload a standard text-based PDF resume (up to 5MB, 10 pages).
                </p>
              </div>

              <FileDropzone
                onParsed={handleResumeParsed}
                onParsingStatus={handleParsingStatus}
              />

              {parsedResume && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(18, 23, 34, 0.7)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  id="parsed-resume-details"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: 'var(--success)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        ✓ Resume Successfully Parsed
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        {parsedResume.filename} · {parsedResume.pages} {parsedResume.pages === 1 ? 'page' : 'pages'} ·{' '}
                        {parsedResume.charCount.toLocaleString()} characters
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowExtractedText((prev) => !prev)}
                      className="btn btn-secondary"
                      id="toggle-text-preview-btn"
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                    >
                      {showExtractedText ? 'Hide Extracted Text' : 'View Extracted Text'}
                    </button>
                  </div>

                  {showExtractedText && (
                    <pre
                      id="extracted-text-preview"
                      style={{
                        marginTop: '0.75rem',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        padding: '0.85rem',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
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

            {/* Step 2: Job Description & Optional Title */}
            <div className="glass-card">
              <div style={{ marginBottom: '1.25rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    color: 'var(--accent-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Step 2
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Target Job Description</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  Paste the job posting you are targeting to calculate keyword match and AI suggestions.
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="analysis-title-input"
                  className="form-label"
                  style={{ fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}
                >
                  Analysis Title (Optional)
                </label>
                <input
                  type="text"
                  id="analysis-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer - Google"
                  disabled={isLoading}
                  className="form-input"
                  maxLength={100}
                />
              </div>

              <JdTextarea
                id="job-description-textarea"
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isLoading}
              />
            </div>

            {/* Submit Action Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <button
                type="submit"
                disabled={!isReadyToAnalyze}
                className="btn btn-primary"
                id="analyze-submit-btn"
                style={{
                  padding: '0.9rem 2.5rem',
                  fontSize: '1.1rem',
                  minWidth: '240px',
                  opacity: !isReadyToAnalyze ? 0.5 : 1,
                  cursor: !isReadyToAnalyze ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Spinner size="1.25rem" />
                    <span>Analyzing ATS Compatibility...</span>
                  </span>
                ) : (
                  <span>🚀 Analyze Resume ATS Match</span>
                )}
              </button>

              {!isReadyToAnalyze && !isLoading && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {!parsedResume?.text
                    ? 'Upload a valid resume PDF to continue'
                    : jdCharCount < 50
                    ? `Add ${50 - jdCharCount} more characters to the job description`
                    : jdCharCount > 10000
                    ? 'Job description exceeds 10,000 characters'
                    : ''}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
