import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/http.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Spinner from '../components/Spinner.jsx';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setError(null);
      try {
        const response = await api.get(`/analyses?page=${page}&limit=10`);
        if (!ignore) {
          setAnalyses(response.analyses || []);
          setPagination({
            total: response.total || 0,
            totalPages: response.totalPages || 1,
          });
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load analysis history.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [page]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`/analyses/${deleteTarget.id}`);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      // If last item on page was deleted and page > 1, go to previous page
      if (analyses.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setPagination((prev) => {
          const newTotal = Math.max(0, prev.total - 1);
          return {
            ...prev,
            total: newTotal,
            totalPages: Math.max(1, Math.ceil(newTotal / 10)),
          };
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to delete analysis.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Analysis History</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Review past resume analyses, track ATS compatibility trends, and manage saved reports.
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-primary" id="history-new-analysis-btn">
          + Analyze New Resume
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="alert-error" id="history-error-banner" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontWeight: 800 }}>!</span>
          <div>{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
            gap: '1rem',
          }}
          id="history-loading-state"
        >
          <Spinner size="2.5rem" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your saved analyses...</p>
        </div>
      ) : analyses.length === 0 ? (
        /* Empty State */
        !error ? (
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              maxWidth: '600px',
              margin: '2rem auto',
            }}
            id="history-empty-state"
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 1.25rem',
              }}
            >
              📋
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Analyses Saved Yet</h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '1.75rem',
                lineHeight: '1.5',
              }}
            >
              Upload your resume PDF and match it against any job description to generate your first ATS score and AI optimization report.
            </p>
            <Link to="/dashboard" className="btn btn-primary" id="empty-state-cta-btn">
              Analyze Resume Now
            </Link>
          </div>
        ) : null
      ) : (
        /* Analyses List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="history-list-container">
          {analyses.map((item) => {
            const score = Math.round(item.score);
            let scoreColor = '#ef4444';
            let scoreBg = 'rgba(239, 68, 68, 0.12)';
            let scoreBorder = 'rgba(239, 68, 68, 0.3)';

            if (score >= 75) {
              scoreColor = '#10b981';
              scoreBg = 'rgba(16, 185, 129, 0.12)';
              scoreBorder = 'rgba(16, 185, 129, 0.3)';
            } else if (score >= 50) {
              scoreColor = '#f59e0b';
              scoreBg = 'rgba(245, 158, 11, 0.12)';
              scoreBorder = 'rgba(245, 158, 11, 0.3)';
            }

            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '';

            return (
              <div
                key={item.id}
                className="glass-card history-item-card"
                id={`history-item-${item.id}`}
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                {/* Score badge & Title info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '240px', flex: 1 }}>
                  {/* Score pill */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '3.75rem',
                      height: '3.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: scoreBg,
                      border: `1px solid ${scoreBorder}`,
                      color: scoreColor,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>
                      {score}
                    </span>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Score
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                      <Link
                        to={`/analyses/${item.id}`}
                        style={{ color: 'var(--text-primary)' }}
                        className="history-item-link"
                      >
                        {item.title || 'Resume Analysis'}
                      </Link>
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {formattedDate && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📅 {formattedDate}
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        ✓ {item.matched?.length || 0} matched
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#f87171' }}>
                        ✕ {item.missing?.length || 0} missing
                      </span>
                    </div>

                    {item.jdSnippet && (
                      <p
                        style={{
                          margin: '0.35rem 0 0',
                          fontSize: '0.825rem',
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.jdSnippet}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Link
                    to={`/analyses/${item.id}`}
                    className="btn btn-secondary"
                    id={`view-analysis-${item.id}`}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    View Report
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="btn btn-secondary"
                    id={`delete-analysis-${item.id}`}
                    aria-label={`Delete analysis ${item.title || item.id}`}
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.85rem',
                      color: '#f87171',
                      borderColor: 'rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
              id="history-pagination"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary"
                id="pagination-prev-btn"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                ← Previous
              </button>

              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Page {page} of {pagination.totalPages} ({pagination.total} total)
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn btn-secondary"
                id="pagination-next-btn"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accessible Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Analysis Record?"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this analysis'}"? This record will be permanently removed.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        isDestructive={true}
        isBusy={isDeleting}
      />
    </div>
  );
}
