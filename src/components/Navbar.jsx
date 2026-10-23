import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/plants', label: 'Plant library' },
  { to: '/blog', label: 'Field journal' },
  { to: '/faq', label: 'FAQ' },
];

const AUTH_NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/diagnose', label: 'Diagnose' },
  { to: '/history', label: 'History' },
  { to: '/plants', label: 'Plant library' },
  { to: '/chat', label: 'Live Chat' },
  { to: '/blog', label: 'Field journal' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const roleColor = {
    FARMER: '#13856b',
    SCIENTIST: '#5279a8',
    AGRICULTURIST: '#bd7c24',
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <Link to="/plants" className="navbar-promo">
        <span>GROW WITH CONFIDENCE</span>
        <span>Explore the AgriDiag plant library <span aria-hidden="true">→</span></span>
      </Link>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" aria-label="AgriDiag home">
          <span className="logo-icon" aria-hidden="true">✿</span>
          <span className="logo-text">Agri<span>Diag</span></span>
        </Link>

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

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar" style={{ borderColor: roleColor[user?.role] || '#13856b' }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role" style={{ color: roleColor[user?.role] || '#13856b' }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          id="navbar-hamburger"
        >
          <span /><span /><span />
        </button>
      </div>

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
              <button className="btn btn-danger w-full" onClick={handleLogout}>Sign out</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
