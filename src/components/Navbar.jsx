import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = event => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

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
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" aria-label="AgriDiag home">
          <span className="logo-icon" aria-hidden="true">✿</span>
          <span className="logo-text">Agri<span>Diag</span></span>
        </Link>

        <nav className="navbar-links" aria-label="Main navigation">
          {(isAuthenticated ? AUTH_NAV_LINKS : NAV_LINKS).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar" style={{ borderColor: roleColor[user?.role] || '#13856b' }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Your account'}</span>
                  <span className="user-role" style={{ color: roleColor[user?.role] || '#13856b' }}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button type="button" className="navbar-signout" onClick={handleLogout}>Sign out</button>
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
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-menu"
          id="navbar-hamburger"
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu animate-fade-in" id="navbar-mobile-menu">
          <nav className="mobile-links" aria-label="Mobile navigation">
            {(isAuthenticated ? AUTH_NAV_LINKS : NAV_LINKS).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className="mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </NavLink>
            ))}
          </nav>
          {isAuthenticated && (
            <div className="mobile-user">
              <span className="user-avatar" aria-hidden="true">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </span>
              <span>
                <strong>{user?.name || 'Your account'}</strong>
                <small>{user?.role?.replace('_', ' ')}</small>
              </span>
            </div>
          )}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <button type="button" className="btn btn-outline w-full" onClick={handleLogout}>Sign out</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
