import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx';
import Login from '../src/pages/Login.jsx';
import Register from '../src/pages/Register.jsx';
import ProtectedRoute from '../src/components/ProtectedRoute.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Client Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('renders login form with inputs and submit button', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('validates required fields before submitting', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      expect(await screen.findByText(/Email address is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('shows error banner when login credentials are invalid', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));
      api.post.mockRejectedValue({
        status: 401,
        message: 'Invalid email or password',
      });

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'WrongPassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid email or password/i);
    });

    it('submits form successfully and redirects on valid credentials', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));
      api.post.mockResolvedValue({
        user: { id: 'u1', name: 'Valid User', email: 'valid@example.com' },
      });

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<div>Dashboard Page Content</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'valid@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'Password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/auth/login', {
          email: 'valid@example.com',
          password: 'Password123',
        });
        expect(screen.getByText('Dashboard Page Content')).toBeInTheDocument();
      });
    });
  });

  describe('Register Page', () => {
    it('validates weak password client-side', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/register']}>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      );

      fireEvent.change(await screen.findByLabelText(/Full Name/i), {
        target: { value: 'Jane Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'short' }, // too short & no number
      });

      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(
        await screen.findByText(/Password does not meet all criteria/i)
      ).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('displays error banner when registration fails with conflict', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));
      api.post.mockRejectedValue({
        status: 409,
        message: 'An account with this email already exists',
      });

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/register']}>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      );

      fireEvent.change(await screen.findByLabelText(/Full Name/i), {
        target: { value: 'Duplicate Jane' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'ValidPass123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /An account with this email already exists/i
      );
    });
  });

  describe('ProtectedRoute Component', () => {
    it('redirects unauthenticated users to /login', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <div>Secret Protected Area</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Redirected to Login View</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Redirected to Login View')).toBeInTheDocument();
        expect(screen.queryByText('Secret Protected Area')).not.toBeInTheDocument();
      });
    });

    it('renders protected child component when session exists', async () => {
      api.get.mockResolvedValue({
        user: { id: 'u1', name: 'Authorized User', email: 'auth@example.com' },
      });

      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <div>Secret Protected Area</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login View</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      expect(await screen.findByText('Secret Protected Area')).toBeInTheDocument();
      expect(screen.queryByText('Login View')).not.toBeInTheDocument();
    });
  });

  describe('AuthContext logout', () => {
    function LogoutTestComponent() {
      const { user, logout } = useAuth();
      return (
        <div>
          <span data-testid="user-state">{user ? user.name : 'Logged Out'}</span>
          <button type="button" onClick={logout}>
            Trigger Logout
          </button>
        </div>
      );
    }

    it('clears user session when logout is called', async () => {
      api.get.mockResolvedValue({
        user: { id: 'u1', name: 'Alice Bob', email: 'alice@example.com' },
      });
      api.post.mockResolvedValue({});

      render(
        <AuthProvider>
          <LogoutTestComponent />
        </AuthProvider>
      );

      expect(await screen.findByText('Alice Bob')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Trigger Logout'));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/auth/logout');
        expect(screen.getByTestId('user-state')).toHaveTextContent('Logged Out');
      });
    });
  });
});
