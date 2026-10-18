import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('App component and Header Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand name and navigation for guest users', async () => {
    api.get.mockResolvedValueOnce({ user: null });

    render(<App />);
    expect(screen.getByText('ResumeIQ')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign Out/i })).not.toBeInTheDocument();
  });

  it('renders user badge and handles sign out flow', async () => {
    api.get.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Alex Johnson', email: 'alex@example.com' },
    });
    api.post.mockResolvedValueOnce({});

    render(<App />);

    // Wait for user to be loaded
    expect(await screen.findByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutBtn).toBeInTheDocument();

    // Click Sign Out
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    // Should redirect to /login and show Login heading/form
    expect(await screen.findByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument();
  });
});
