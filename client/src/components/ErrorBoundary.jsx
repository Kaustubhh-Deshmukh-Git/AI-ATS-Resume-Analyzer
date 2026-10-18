import React from 'react';

/**
 * Global or modular Error Boundary to catch render crashes gracefully.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error, _errorInfo) {
    // Avoid logging raw error text or component stacks to protect privacy and avoid PII leaks
    if (import.meta.env?.MODE !== 'test') {
      console.error('[ErrorBoundary] Component rendering exception caught');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="glass-card error-boundary-card"
          style={{
            maxWidth: '600px',
            margin: '3rem auto',
            textAlign: 'center',
            padding: '2.5rem 2rem',
          }}
          id="error-boundary-fallback"
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              color: 'var(--danger)',
              margin: '0 auto 1.25rem',
            }}
          >
            !
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
            }}
          >
            An unexpected error occurred while rendering this view. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              id="error-boundary-reload-btn"
            >
              Reload Page
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={this.handleReset}
              id="error-boundary-retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
