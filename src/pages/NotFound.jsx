import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = (event) => {
    event.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <main className="notfound-page">
      <div className="notfound-container container">
        <div className="notfound-visual">
          <div className="notfound-illustration animate-float" aria-hidden="true">
            <div className="notfound-leaf-shape" />
            <div className="notfound-leaf-vein" />
            <span className="notfound-mark">?</span>
          </div>
          <div className="notfound-code-wrap">
            <h1 className="notfound-code text-gradient">404</h1>
            <div className="notfound-badge">LEAF NOT FOUND</div>
          </div>
        </div>

        <div className="notfound-content animate-fade-in">
          <span className="notfound-eyebrow">OOPS! PAGE NOT FOUND</span>
          <h2>The page you’re looking for has withered.</h2>
          <p>
            We couldn’t find this page. It may have been moved, deleted, or never existed in
            the first place. Let’s get you back to your garden.
          </p>

          <div className="notfound-actions">
            <Link to="/" className="btn btn-primary btn-lg">
              Go to home page
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={handleGoBack}
            >
              Return to last page
            </button>
          </div>

          <div className="notfound-explore">
            <span className="notfound-explore-label">WANT TO EXPLORE INSTEAD?</span>
            <div className="notfound-links">
              <Link to="/diagnose" className="notfound-link">
                <span>Check a plant leaf</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/plants" className="notfound-link">
                <span>Browse plant library</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/history" className="notfound-link">
                <span>View your history</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/faq" className="notfound-link">
                <span>Get help / FAQ</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
