import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyApi } from '../services/api';

const roleColor = { FARMER: '#22c55e', SCIENTIST: '#3b82f6', AGRICULTURIST: '#f59e0b' };
const roleIcon  = { FARMER: '🌾', SCIENTIST: '🔬', AGRICULTURIST: '🌱' };

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ total: 0, diseases: 0, healthy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi.list(0, 5).then(res => {
      const data = res.data.data || [];
      setRecent(data);
      const total = res.data.total || 0;
      const healthy = data.filter(d => d.is_healthy).length;
      const uniqueDiseases = new Set(data.filter(d => !d.is_healthy).map(d => d.disease)).size;
      setStats({ total, diseases: uniqueDiseases, healthy });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = dt => new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return (
    <div className="page">
      <div className="container">
        {/* Welcome */}
        <div className="dash-welcome card card-glass" style={{ marginBottom: 'var(--sp-8)' }}>
          <div>
            <span style={{ fontSize: '2rem' }}>{roleIcon[user?.role] || '🌿'}</span>
            <h1 style={{ fontSize: '1.8rem', margin: 'var(--sp-3) 0 var(--sp-2)' }}>
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <span className="badge badge-green">{user?.role}</span>
          </div>
          <Link to="/diagnose" className="btn btn-primary btn-lg">
            🌿 Diagnose a Plant
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: 'var(--sp-8)' }}>
          {[
            { label: 'Total Diagnoses', value: stats.total, icon: '📊' },
            { label: 'Diseases Found', value: stats.diseases, icon: '🦠' },
            { label: 'Healthy Plants', value: stats.healthy, icon: '✅' },
          ].map(s => (
            <div key={s.label} className="card stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <span style={{ fontSize: '2.2rem' }}>{s.icon}</span>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          {/* Recent diagnoses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <h3>Recent Diagnoses</h3>
              <Link to="/history" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {loading ? (
              <div className="loading-center" style={{ padding: 'var(--sp-8)' }}><div className="spinner" /></div>
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                <div className="empty-icon">🌱</div>
                <p>No diagnoses yet. <Link to="/diagnose" style={{ color: 'var(--color-primary)' }}>Diagnose your first plant!</Link></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {recent.map(d => (
                  <Link to={`/results/${d.id || d._id}`} key={d.id || d._id} className="diagnosis-card">
                    <div className="thumb-placeholder">🌿</div>
                    <div className="card-info">
                      <div className="card-plant">{d.plant}</div>
                      <div className="card-disease">{d.disease}</div>
                    </div>
                    <div className="card-meta">
                      <span className={`badge ${d.is_healthy ? 'badge-green' : 'badge-amber'}`}>
                        {d.is_healthy ? 'Healthy' : `${(d.confidence * 100).toFixed(0)}%`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(d.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick access */}
          <div>
            <h3 style={{ marginBottom: 'var(--sp-4)' }}>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[
                { to: '/diagnose', icon: '🔬', title: 'New Diagnosis', desc: 'Upload a leaf image' },
                { to: '/history', icon: '📋', title: 'History', desc: 'View past diagnoses' },
                { to: '/plants', icon: '🌿', title: 'Plant Database', desc: 'Browse plants & diseases' },
                { to: '/chat', icon: '💬', title: 'Live Chat', desc: 'Get expert support' },
                { to: '/feedback', icon: '⭐', title: 'Feedback', desc: 'Share your experience' },
                { to: '/model', icon: '🤗', title: 'Direct Model', desc: 'Interact with CNN model' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="diagnosis-card card-hover">
                  <div className="thumb-placeholder" style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                  <div className="card-info">
                    <div className="card-plant">{item.title}</div>
                    <div className="card-disease">{item.desc}</div>
                  </div>
                  <span style={{ color: 'var(--color-primary)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .dash-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-8);
          flex-wrap: wrap;
          gap: var(--sp-5);
        }
        .dash-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: var(--sp-8);
        }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
