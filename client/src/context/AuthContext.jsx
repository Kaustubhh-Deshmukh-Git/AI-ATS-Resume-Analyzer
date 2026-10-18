import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionError, setSessionError] = useState(null);

  // Counter to invalidate superseded auth requests
  const authOpSeq = useRef(0);

  // Check existing session on application mount
  useEffect(() => {
    let ignore = false;
    const seq = ++authOpSeq.current;

    api
      .get('/auth/me')
      .then((data) => {
        if (!ignore && authOpSeq.current === seq) {
          setUser(data?.user || null);
          setSessionError(null);
        }
      })
      .catch((err) => {
        if (!ignore && authOpSeq.current === seq) {
          const isUnauthorized =
            err.status === 401 ||
            err.code === 'UNAUTHORIZED' ||
            err.message === 'Unauthorized' ||
            err.message?.toLowerCase().includes('unauthorized');

          if (isUnauthorized) {
            setUser(null);
            setSessionError(null);
          } else {
            setUser(null);
            setSessionError(err.message || 'Session verification failed. Please check your connection.');
          }
        }
      })
      .finally(() => {
        if (!ignore && authOpSeq.current === seq) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const retrySessionCheck = useCallback(async () => {
    setLoading(true);
    setSessionError(null);
    const seq = ++authOpSeq.current;
    try {
      const data = await api.get('/auth/me');
      if (authOpSeq.current === seq) {
        setUser(data?.user || null);
        setSessionError(null);
      }
    } catch (err) {
      if (authOpSeq.current === seq) {
        const isUnauthorized =
          err.status === 401 ||
          err.code === 'UNAUTHORIZED' ||
          err.message === 'Unauthorized' ||
          err.message?.toLowerCase().includes('unauthorized');

        if (isUnauthorized) {
          setUser(null);
          setSessionError(null);
        } else {
          setUser(null);
          setSessionError(err.message || 'Session verification failed. Please check your connection.');
        }
      }
    } finally {
      if (authOpSeq.current === seq) {
        setLoading(false);
      }
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setSessionError(null);
    const seq = ++authOpSeq.current;

    try {
      const data = await api.post('/auth/login', { email, password });
      if (authOpSeq.current === seq) {
        setUser(data.user);
      }
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setError(null);
    setSessionError(null);
    const seq = ++authOpSeq.current;

    try {
      const data = await api.post('/auth/register', { name, email, password });
      if (authOpSeq.current === seq) {
        setUser(data.user);
      }
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    authOpSeq.current += 1;
    try {
      await api.post('/auth/logout');
      setUser(null);
      setSessionError(null);
    } catch (err) {
      const msg = err.message || 'Logout failed. Please try again.';
      setError(msg);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setSessionError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    sessionError,
    retrySessionCheck,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
