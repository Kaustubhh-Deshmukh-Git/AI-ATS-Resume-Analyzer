import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../src/components/ConfirmModal.jsx';
import ErrorBoundary from '../src/components/ErrorBoundary.jsx';

describe('Milestone 5 - Accessibility & Keyboard Controls (UI-8)', () => {
  it('UI-8: ConfirmModal traps focus and closes on Escape key', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    const { rerender } = render(
      <div>
        <button id="trigger-btn" type="button">
          Open Modal
        </button>
        <ConfirmModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </div>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-modal-title');

    // Press Escape to dismiss
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Tab key cycling
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });

    deleteBtn.focus();
    expect(document.activeElement).toBe(deleteBtn);

    // Tab on last element wraps to first
    fireEvent.keyDown(dialog, { key: 'Tab' });

    // Shift-Tab on first element wraps to last
    cancelBtn.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    // Rerender as closed
    rerender(
      <div>
        <button id="trigger-btn" type="button">
          Open Modal
        </button>
        <ConfirmModal
          isOpen={false}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </div>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ErrorBoundary renders accessible fallback UI on runtime exceptions', () => {
    // Component that intentionally throws
    function ProblematicComponent() {
      throw new Error('Test rendering crash');
    }

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Test rendering crash')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();
  });
});
