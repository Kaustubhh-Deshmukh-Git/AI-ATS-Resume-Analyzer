import { useId } from 'react';

/**
 * Accessible Job Description textarea component with live character counting
 * and boundary validation (50 to 10,000 characters).
 *
 * @param {object} props
 * @param {string} props.value - Text content of the job description
 * @param {function} props.onChange - Change handler (receives string)
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {string} [props.error] - Optional external error message
 * @param {string} [props.id] - Optional custom element ID
 */
export default function JdTextarea({
  value,
  onChange,
  disabled = false,
  error = null,
  id: customId,
}) {
  const generatedId = useId();
  const inputId = customId || `jd-input-${generatedId}`;
  const counterId = `jd-counter-${generatedId}`;
  const errorId = `jd-error-${generatedId}`;

  const charCount = value ? value.length : 0;
  const isTooShort = charCount > 0 && charCount < 50;
  const isTooLong = charCount > 10000;
  const isValid = charCount >= 50 && charCount <= 10000;

  let counterColor = 'var(--text-muted)';
  if (isTooShort) counterColor = 'var(--warning)';
  else if (isTooLong) counterColor = 'var(--danger)';
  else if (isValid) counterColor = 'var(--success)';

  return (
    <div className="form-group jd-textarea-group">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.4rem',
        }}
      >
        <label htmlFor={inputId} className="form-label" style={{ fontWeight: 600 }}>
          Job Description <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div
          id={counterId}
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: counterColor,
            transition: 'color var(--transition-fast)',
          }}
        >
          {charCount.toLocaleString()} / 10,000 characters
          {isTooShort && (
            <span style={{ marginLeft: '0.4rem' }}>
              ({50 - charCount} more needed)
            </span>
          )}
          {isTooLong && (
            <span style={{ marginLeft: '0.4rem' }}>
              ({charCount - 10000} over limit)
            </span>
          )}
        </div>
      </div>

      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
        placeholder="Paste the target job description here (minimum 50 characters, e.g. role responsibilities, required qualifications, technical stack)..."
        className={`form-input jd-textarea ${
          error || isTooLong ? 'is-invalid' : ''
        }`}
        aria-describedby={`${counterId} ${error ? errorId : ''}`}
        aria-invalid={Boolean(error || isTooLong)}
        aria-required="true"
        style={{
          resize: 'vertical',
          minHeight: '160px',
          fontFamily: 'inherit',
          lineHeight: '1.6',
        }}
      />

      {error && (
        <div id={errorId} className="field-error" role="alert">
          {error}
        </div>
      )}

      {isTooShort && !error && (
        <div className="field-hint" style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Job description must be at least 50 characters to perform accurate keyword taxonomy matching.
        </div>
      )}
    </div>
  );
}
