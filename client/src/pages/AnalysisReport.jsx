import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/http.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import BreakdownBars from '../components/BreakdownBars.jsx';
import KeywordChips from '../components/KeywordChips.jsx';
import AiSuggestions from '../components/AiSuggestions.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Spinner from '../components/Spinner.jsx';

export default function AnalysisReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/analyses/${id}`);
        if (isMounted) {
          setAnalysis(response.analysis);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load analysis report.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchAnalysis();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/analyses/${id}`);
      setShowDeleteModal(false);
      navigate('/history');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete analysis.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
        }}
        id="report-loading-state"
      >
        <Spinner size="2.5rem" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div
        className="glass-card"
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          textAlign: 'center',
          padding: '2.5rem',
        }}
        id="report-error-state"
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 1rem',
          }}
        >
          !
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Report Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {error || 'The requested analysis does not exist or you do not have permission to view it.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-primary" id="report-back-dashboard-btn">
            Go to Dashboard
          </Link>
          <Link to="/history" className="btn btn-secondary" id="report-back-history-btn">
            View History
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} id="analysis-report-view">
      {/* Delete Error Alert */}
      {deleteError && (
        <div
          role="alert"
          className="alert-error"
          id="report-delete-error"
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontWeight: 800 }}>!</span>
          <div>{deleteError}</div>
        </div>
      )}

      {/* Top Navigation & Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/history"
            className="btn btn-secondary"
            id="back-to-history-btn"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            ← Back to History
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-secondary"
            id="back-to-dashboard-btn"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            + New Analysis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="btn btn-secondary"
          id="delete-analysis-btn"
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.85rem',
            color: '#f87171',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          🗑 Delete Report
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Glass Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
                {analysis.title || 'ATS Compatibility Report'}
              </h1>
              {createdDate && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Analyzed on {createdDate}
                </span>
              )}
            </div>

            {analysis.jdSnippet && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  margin: '0.5rem 0 0',
                }}
              >
                Target JD: &ldquo;{analysis.jdSnippet}&rdquo;
              </p>
            )}
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
              <ScoreGauge score={analysis.score} size="190px" />
            </div>

            <div>
              <BreakdownBars breakdown={analysis.breakdown} />
            </div>
          </div>
        </div>

        {/* Keyword Chips Component */}
        <KeywordChips matched={analysis.matched} missing={analysis.missing} />

        {/* AI Suggestions Component */}
        <AiSuggestions aiStatus={analysis.aiStatus} ai={analysis.ai} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Analysis Report?"
        message="Are you sure you want to delete this analysis report? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Report'}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
        isDestructive={true}
        isBusy={isDeleting}
      />
    </div>
  );
}
