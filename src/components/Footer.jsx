import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">🌿 AgriDiag</Link>
            <p>AI-powered plant disease diagnosis to help farmers, scientists, and agriculturists reduce crop losses.</p>
            <p className="footer-disclaimer">⚠️ AI-assisted results are for informational purposes only. Consult an agricultural expert for critical decisions.</p>
          </div>
          <div className="footer-links-group">
            <h4>Platform</h4>
            <Link to="/diagnose">Diagnose Plant</Link>
            <Link to="/history">Diagnosis History</Link>
            <Link to="/plants">Plant Database</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-links-group">
            <h4>Resources</h4>
            <Link to="/blog">Blog & Resources</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/chat">Live Chat</Link>
            <Link to="/feedback">Feedback</Link>
          </div>
          <div className="footer-links-group">
            <h4>Account</h4>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/model">Direct Model</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} AgriDiag. All rights reserved.</span>
          <span>Built with 🌿 to support agriculture</span>
        </div>
      </div>
      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: var(--sp-16) 0 var(--sp-6);
          margin-top: 0;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--sp-10);
          margin-bottom: var(--sp-10);
        }
        .footer-logo {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--color-primary);
          display: block;
          margin-bottom: var(--sp-3);
        }
        .footer-brand p {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.7;
        }
        .footer-disclaimer {
          margin-top: var(--sp-3) !important;
          font-size: 0.78rem !important;
          color: #8a6a35 !important;
        }
        .footer-links-group {
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
        }
        .footer-links-group h4 {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: var(--sp-1);
        }
        .footer-links-group a {
          color: var(--text-muted);
          font-size: 0.88rem;
          transition: color var(--t-fast);
        }
        .footer-links-group a:hover { color: var(--color-primary); }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--sp-6);
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.83rem;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: var(--sp-8); }
          .footer-brand { grid-column: 1 / -1; }
          .footer-bottom { flex-direction: column; gap: var(--sp-2); text-align: center; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
