import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { diagnosisApi } from '../services/api';

function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="confidence-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="ring-value">
        {pct}%
        <span className="ring-label">confidence</span>
      </div>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const { state } = useLocation();
  const [diagnosis, setDiagnosis] = useState(state?.diagnosis || null);
  const [loading, setLoading] = useState(!state?.diagnosis);
  const [activeTab, setActiveTab] = useState('treatment');

  useEffect(() => {
    if (!diagnosis && id) {
      diagnosisApi.getById(id)
        .then(r => setDiagnosis(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, diagnosis]);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-muted)' }}>Loading diagnosis…</p>
    </div>
  );

  if (!diagnosis) return (
    <div className="empty-state page"><div className="empty-icon">❌</div><h3>Diagnosis not found</h3><Link to="/diagnose" className="btn btn-primary mt-4">New Diagnosis</Link></div>
  );

  const d = diagnosis;
  const pct = Math.round(d.confidence * 100);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Low confidence warning */}
        {d.is_low_confidence && (
          <div className="alert alert-warning animate-fade-in" style={{ marginBottom: 'var(--sp-6)' }}>
            <span>⚠️</span>
            <div>{d.low_confidence_warning}</div>
          </div>
        )}

        {/* Mock badge */}
        {d._mock && (
          <div className="alert alert-info" style={{ marginBottom: 'var(--sp-6)' }}>
            <span>🔬</span> <div>Using demo prediction (no HuggingFace API token configured). Set <code>HF_API_TOKEN</code> in backend <code>.env</code> for real inference.</div>
          </div>
        )}

        {/* Result hero */}
        <div className="card card-glass result-hero animate-fade-in">
          {d.image_url && (
            <img
              src={d.image_url}
              alt="Diagnosed leaf"
              className="result-img"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="result-info">
            <div style={{ marginBottom: 'var(--sp-3)' }}>
              <span className="badge badge-gray">Plant</span>
              <h2 style={{ marginTop: 'var(--sp-2)' }}>{d.plant}</h2>
            </div>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <span className={`badge ${d.is_healthy ? 'badge-green' : 'badge-amber'}`}>
                {d.is_healthy ? '✅ Healthy' : '🦠 Disease Detected'}
              </span>
              <h3 style={{ marginTop: 'var(--sp-2)', color: d.is_healthy ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                {d.disease}
              </h3>
            </div>
            {d.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>{d.description}</p>}
          </div>
          <ConfidenceRing value={d.confidence} />
        </div>

        {/* Symptoms & Causes */}
        {(d.symptoms?.length > 0 || d.causes?.length > 0) && (
          <div className="grid-2" style={{ marginTop: 'var(--sp-6)' }}>
            {d.symptoms?.length > 0 && (
              <div className="card animate-fade-in">
                <h4 style={{ marginBottom: 'var(--sp-4)', color: 'var(--color-accent)' }}>🔍 Symptoms</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {d.symptoms.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 'var(--sp-2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {d.causes?.length > 0 && (
              <div className="card animate-fade-in">
                <h4 style={{ marginBottom: 'var(--sp-4)', color: 'var(--error)' }}>⚡ Causes</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {d.causes.map((c, i) => (
                    <li key={i} style={{ display: 'flex', gap: 'var(--sp-2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--error)', flexShrink: 0 }}>▸</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Treatment / Prevention / Management tabs */}
        <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
          <div className="tabs">
            {['treatment', 'prevention', 'management'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'treatment' ? '💊 Treatment' : t === 'prevention' ? '🛡️ Prevention' : '📋 Management'}
              </button>
            ))}
          </div>
          {activeTab === 'treatment' && (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {(d.treatment || []).map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>{i+1}</span>
                  {t}
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'prevention' && (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {(d.prevention || []).map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>✓</span> {p}
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'management' && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.92rem' }}>
              {d.management || 'No management notes available.'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6" style={{ flexWrap: 'wrap' }}>
          <Link to="/diagnose" className="btn btn-primary">🌿 New Diagnosis</Link>
          <Link to="/history" className="btn btn-outline">📋 View History</Link>
          <Link to="/feedback" className="btn btn-ghost">⭐ Leave Feedback</Link>
        </div>
      </div>

      <style>{`
        .result-hero { display: flex; gap: var(--sp-6); align-items: flex-start; flex-wrap: wrap; }
        .result-img { width: 200px; height: 200px; object-fit: cover; border-radius: var(--r-lg); flex-shrink: 0; }
        .result-info { flex: 1; min-width: 200px; }
        @media (max-width: 600px) { .result-img { width: 100%; height: 240px; } }
      `}</style>
    </div>
  );
}
