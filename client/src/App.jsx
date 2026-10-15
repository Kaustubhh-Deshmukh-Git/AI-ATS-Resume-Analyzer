import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
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
            >
              Dashboard
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Login
            </NavLink>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem' }}>
              Sign Up
            </Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>ResumeIQ &copy; {new Date().getFullYear()} — ATS Resume Analyzer & AI Optimization Engine</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
