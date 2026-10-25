import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyApi } from '../services/api';
import { getFriendlyErrorMessage } from '../services/errors';
import './Dashboard.css';

const ROLE_COPY = {
  FARMER: 'Your growing season, at a glance.',
  SCIENTIST: 'A clearer view of your plant observations.',
  AGRICULTURIST: 'Your latest field insights, all in one place.',
};

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function DashboardStat({ label, value, note }) {
  return (
    <article className="dashboard-stat">
      <span className="dashboard-stat-label">{label}</span>
      <strong className="dashboard-stat-value">{value}</strong>
      <span className="dashboard-stat-note">{note}</span>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await historyApi.list(0, 100);
      const records = response.data.data || [];
      setRecent(records);
      setTotal(response.data.total || 0);
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError, 'dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Grower';
  const healthyCount = recent.filter(record => record.is_healthy).length;
  const attentionCount = recent.filter(record => !record.is_healthy).length;
  const role = user?.role?.toLowerCase() || 'grower';

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-heading">
          <div>
            <span className="dashboard-kicker">YOUR AGRIDIAG OVERVIEW</span>
            <h1>Good to see you, {firstName}.</h1>
            <p>{ROLE_COPY[user?.role] || 'A little more clarity for every growing season.'}</p>
          </div>
          <Link to="/diagnose" className="dashboard-primary-action">
            <span>Start a new diagnosis</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <section className="dashboard-feature">
          <img
            className="dashboard-feature-image"
            src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1800&q=85"
            alt="Healthy green leaves growing in natural light"
          />
          <div className="dashboard-feature-shade" />
          <div className="dashboard-feature-content">
            <span className="dashboard-feature-label">A HEALTHIER FIELD STARTS WITH A CLOSER LOOK</span>
            <h2>Notice a change?<br />Start with a leaf.</h2>
            <p>Upload a clear photo to explore possible causes and practical care guidance.</p>
            <Link to="/diagnose" className="dashboard-feature-link">
              Check plant health <span aria-hidden="true">→</span>
            </Link>
          </div>
          <span className="dashboard-feature-index" aria-hidden="true">01 / PLANT HEALTH</span>
        </section>

        <section className="dashboard-stats" aria-label="Diagnosis summary">
          <DashboardStat
            label="All diagnoses"
            value={loading ? '—' : total}
            note="Saved in your history"
          />
          <DashboardStat
            label="Healthy in recent checks"
            value={loading ? '—' : healthyCount}
            note="From your latest 100 results"
          />
          <DashboardStat
            label="Needs a closer look"
            value={loading ? '—' : attentionCount}
            note="From your latest 100 results"
          />
        </section>

        <div className="dashboard-content-grid">
          <section className="dashboard-activity">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-kicker">YOUR FIELD NOTES</span>
                <h2>Recent diagnoses</h2>
              </div>
              <Link to="/history" className="dashboard-subtle-link">
                View history <span aria-hidden="true">→</span>
              </Link>
            </div>

            {loading ? (
              <div className="dashboard-message" role="status">
                <span className="dashboard-loading-line" />
                Loading your recent diagnoses…
              </div>
            ) : error ? (
              <div className="dashboard-message dashboard-message-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={loadDashboard}>Try again</button>
              </div>
            ) : recent.length === 0 ? (
              <div className="dashboard-empty">
                <span className="dashboard-empty-rule" />
                <h3>Your first field note starts here.</h3>
                <p>Run a plant health check and your diagnosis will be saved here for later.</p>
                <Link to="/diagnose" className="dashboard-subtle-link">
                  Make your first diagnosis <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <div className="dashboard-record-list">
                {recent.slice(0, 5).map((record, index) => {
                  const recordId = record.id || record._id;
                  const confidence = Number.isFinite(record.confidence)
                    ? `${Math.round(record.confidence * 100)}%`
                    : '—';

                  return (
                    <Link
                      to={`/results/${recordId}`}
                      key={recordId}
                      className="dashboard-record"
                    >
                      {record.image_url ? (
                        <img
                          className="dashboard-record-image"
                          src={record.image_url}
                          alt={`${record.plant} leaf`}
                          loading="lazy"
                        />
                      ) : (
                        <span className="dashboard-record-image dashboard-record-placeholder" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                      <span className="dashboard-record-copy">
                        <strong>{record.plant}</strong>
                        <span>{record.disease}</span>
                      </span>
                      <span className="dashboard-record-status">
                        <span className={`dashboard-status-dot ${record.is_healthy ? 'is-healthy' : 'needs-attention'}`} />
                        {record.is_healthy ? 'Healthy' : 'Review result'}
                      </span>
                      <span className="dashboard-record-meta">
                        <strong>{confidence}</strong>
                        <span>{formatDate(record.created_at)}</span>
                      </span>
                      <span className="dashboard-record-arrow" aria-hidden="true">↗</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="dashboard-aside">
            <section className="dashboard-profile-card">
              <span className="dashboard-kicker">YOUR SPACE</span>
              <h2>Growing with purpose.</h2>
              <p>
                Your workspace is set up for a <strong>{role}</strong>. Keep your observations
                close and build a useful picture of plant health over time.
              </p>
              <div className="dashboard-profile-divider" />
              <span className="dashboard-profile-label">CURRENT ROLE</span>
              <span className="dashboard-role-value">{user?.role || 'Grower'}</span>
            </section>

            <section className="dashboard-shortcuts">
              <span className="dashboard-kicker">QUICK LINKS</span>
              <Link to="/plants" className="dashboard-shortcut">
                <span>Plant library</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/chat" className="dashboard-shortcut">
                <span>Ask for guidance</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/feedback" className="dashboard-shortcut">
                <span>Share feedback</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </section>
          </aside>
        </div>

        <p className="dashboard-disclaimer">
          AI-assisted results are a starting point, not a definitive diagnosis. Confirm important
          decisions with a qualified agricultural professional.
        </p>
      </div>
    </main>
  );
}
