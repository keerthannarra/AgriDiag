import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/plants', label: 'Plants DB' },
  { to: '/blog', label: 'Resources' },
  { to: '/faq', label: 'FAQ' },
];

const AUTH_NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/diagnose', label: '🌿 Diagnose' },
  { to: '/history', label: 'History' },
  { to: '/plants', label: 'Plants DB' },
  { to: '/chat', label: 'Live Chat' },
  { to: '/blog', label: 'Resources' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const roleColor = {
    FARMER: '#22c55e',
    SCIENTIST: '#3b82f6',
    AGRICULTURIST: '#f59e0b',
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Agri<span>Diag</span></span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {(isAuthenticated ? AUTH_NAV_LINKS : NAV_LINKS).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Auth actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar" style={{ borderColor: roleColor[user?.role] || '#22c55e' }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role" style={{ color: roleColor[user?.role] || '#22c55e' }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          id="navbar-hamburger"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          {(isAuthenticated ? AUTH_NAV_LINKS : NAV_LINKS).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <button className="btn btn-danger w-full" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
