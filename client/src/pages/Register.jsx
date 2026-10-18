import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_REGEX = /^(?:[-A-Za-z0-9_'+]+\.)*[-A-Za-z0-9_'+]*[-A-Za-z0-9_+]+@(?:[A-Za-z0-9][-A-Za-z0-9]*\.)+[A-Za-z]{2,}$/;

export default function Register() {
  const navigate = useNavigate();
  const { user, register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Real-time password strength checks
  const passwordCriteria = {
    hasMinLength: formData.password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const validate = () => {
    const errors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      errors.name = 'Full name is required';
    } else if (name.length < 2 || name.length > 60) {
      errors.name = 'Name must be between 2 and 60 characters';
    }

    if (!email) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (
      !passwordCriteria.hasMinLength ||
      !passwordCriteria.hasLetter ||
      !passwordCriteria.hasNumber
    ) {
      errors.password = 'Password does not meet all criteria';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submit

    if (!validate()) return;

    setSubmitting(true);
    setGeneralError('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Capture detailed conflict or validation messages
      if (err.status === 409) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'An account with this email already exists',
        }));
        setGeneralError('An account with this email already exists');
      } else if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const mappedErrors = {};
        err.details.forEach((d) => {
          if (d.field) {
            mappedErrors[d.field] = d.message;
          }
        });
        setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
        setGeneralError(err.message || 'Validation failed. Please check your details.');
      } else {
        const message =
          err.code === 'NETWORK_ERROR'
            ? 'Unable to connect to the server. Please check your internet connection.'
            : err.message || 'Registration failed. Please check your details.';
        setGeneralError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
        }}
        id="register-loading-state"
      >
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div className="glass-card">
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create an Account</h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            textAlign: 'center',
            marginBottom: '1.75rem',
          }}
        >
          Start scanning and optimizing your resumes today
        </p>

        {generalError && (
          <div className="alert-error" role="alert" id="register-error-alert">
            <span>⚠️</span>
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              className={`form-input ${fieldErrors.name ? 'is-invalid' : ''}`}
            />
            {fieldErrors.name && (
              <span className="field-error" id="name-error">
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`}
            />
            {fieldErrors.email && (
              <span className="field-error" id="email-error">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`}
            />
            {fieldErrors.password && (
              <span className="field-error" id="password-error">
                {fieldErrors.password}
              </span>
            )}

            {/* Real-time criteria checklist */}
            <div className="password-criteria" style={{ marginTop: '0.25rem' }}>
              <div className={`criteria-item ${passwordCriteria.hasMinLength ? 'met' : ''}`}>
                <span>{passwordCriteria.hasMinLength ? '✓' : '○'}</span>
                <span>At least 8 characters long</span>
              </div>
              <div className={`criteria-item ${passwordCriteria.hasLetter ? 'met' : ''}`}>
                <span>{passwordCriteria.hasLetter ? '✓' : '○'}</span>
                <span>Contains at least one letter</span>
              </div>
              <div className={`criteria-item ${passwordCriteria.hasNumber ? 'met' : ''}`}>
                <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                <span>Contains at least one number</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="register-submit-btn"
            disabled={submitting}
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
