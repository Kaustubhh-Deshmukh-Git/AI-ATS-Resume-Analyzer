import { useEffect, useRef } from 'react';

/**
 * Accessible focus-trapped confirmation modal.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.title - Modal heading
 * @param {string} props.message - Descriptive body text
 * @param {string} [props.confirmText='Confirm'] - Confirmation button label
 * @param {string} [props.cancelText='Cancel'] - Cancel button label
 * @param {function} props.onConfirm - Confirm callback
 * @param {function} props.onClose - Close/cancel callback
 * @param {boolean} [props.isDestructive=true] - If true, confirm button is styled as danger
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isDestructive = true,
  isBusy = false,
}) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Store previously focused element and restore when closing
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus cancel button by default (safe action)
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus?.();
    }
  }, [isOpen]);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isBusy) return;
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        // Containment check: if current focus is outside the modal, pull it into the modal
        if (!modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isBusy]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (!isBusy && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        className="glass-card modal-content"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {isDestructive && (
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              !
            </div>
          )}
          <h3 id="confirm-modal-title" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {title}
          </h3>
        </div>

        <p
          id="confirm-modal-description"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.925rem',
            lineHeight: '1.5',
            marginBottom: '1.75rem',
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isBusy}
            id="modal-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isBusy}
            id="modal-confirm-btn"
            style={
              isDestructive
                ? {
                    background: 'var(--danger)',
                    color: '#fff',
                    opacity: isBusy ? 0.65 : 1,
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                  }
                : {
                    opacity: isBusy ? 0.65 : 1,
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                  }
            }
          >
            {isBusy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
