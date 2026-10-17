import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand" id="brand-link">
        <span>ResumeIQ</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          id="nav-dashboard-link"
        >
          Dashboard
        </NavLink>
        {user ? (
          <>
            <div className="user-badge" title={user.email} id="nav-user-badge">
              <span className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              <span>{user.name || user.email}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              id="nav-logout-btn"
              style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-login-link"
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="btn btn-primary"
              id="nav-signup-link"
              style={{ padding: '0.45rem 1rem' }}
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="footer">
            <p>
              ResumeIQ &copy; {new Date().getFullYear()} — ATS Resume Analyzer & AI Optimization
              Engine
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
