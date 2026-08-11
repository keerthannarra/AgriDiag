import { useEffect, useState } from 'react';
import { plantsApi } from '../services/api';

export default function PlantDatabase() {
  const [plants, setPlants] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plants');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([plantsApi.list(), plantsApi.listDiseases()])
      .then(([p, d]) => {
        setPlants(p.data.data || []);
        setDiseases(d.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'plants') {
        const r = await plantsApi.list(search);
        setPlants(r.data.data || []);
      } else {
        const r = await plantsApi.listDiseases(search);
        setDiseases(r.data.data || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const severityBadge = s => s === 'High' ? 'badge-red' : s === 'Medium' ? 'badge-amber' : 'badge-green';

  return (
    <div className="page">
      <div className="container">
        <div className="page-hero">
          <span className="section-label">Knowledge Base</span>
          <h1>Plant & Disease Database</h1>
          <p>Browse our comprehensive plant disease encyclopedia with treatment and prevention information.</p>
        </div>

        <div className="tabs" style={{ marginBottom: 'var(--sp-6)' }}>
          <button className={`tab-btn ${activeTab === 'plants' ? 'active' : ''}`} onClick={() => setActiveTab('plants')}>🌿 Plants ({plants.length})</button>
          <button className={`tab-btn ${activeTab === 'diseases' ? 'active' : ''}`} onClick={() => setActiveTab('diseases')}>🦠 Diseases ({diseases.length})</button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-input" id="plant-search" placeholder={`Search ${activeTab}…`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          {search && <button type="button" className="btn btn-outline" onClick={() => setSearch('')}>Clear</button>}
        </form>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : activeTab === 'plants' ? (
          <div className="grid-3">
            {plants.map(p => (
              <div key={p.id || p._id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setSelected({ type: 'plant', data: p })}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>🌿</div>
                <h4 style={{ marginBottom: 'var(--sp-1)' }}>{p.name}</h4>
                {p.scientific_name && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem', marginBottom: 'var(--sp-3)' }}>{p.scientific_name}</p>}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.description?.slice(0, 100)}…</p>
                {p.diseases?.length > 0 && (
                  <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
                    {p.diseases.slice(0, 3).map(d => <span key={d} className="badge badge-amber" style={{ fontSize: '0.72rem' }}>{d}</span>)}
                    {p.diseases.length > 3 && <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>+{p.diseases.length - 3} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid-3">
            {diseases.map(d => (
              <div key={d.id || d._id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setSelected({ type: 'disease', data: d })}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>🦠</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                  <h4>{d.name}</h4>
                  {d.severity && <span className={`badge ${severityBadge(d.severity)}`}>{d.severity}</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{d.description?.slice(0, 100)}…</p>
                {d.affected_plants?.length > 0 && (
                  <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
                    {d.affected_plants.map(p => <span key={p} className="badge badge-green" style={{ fontSize: '0.72rem' }}>{p}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-box card-glass animate-scale-in" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              <h2 style={{ marginBottom: 'var(--sp-6)' }}>{selected.data.name}</h2>
              {selected.data.scientific_name && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--sp-4)' }}>{selected.data.scientific_name}</p>}
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 'var(--sp-6)' }}>{selected.data.description}</p>
              {selected.data.symptoms?.length > 0 && (
                <div style={{ marginBottom: 'var(--sp-5)' }}>
                  <h4 style={{ marginBottom: 'var(--sp-3)', color: 'var(--color-accent)' }}>Symptoms</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    {selected.data.symptoms.map((s, i) => <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>▸ {s}</li>)}
                  </ul>
                </div>
              )}
              {selected.data.treatment?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 'var(--sp-3)', color: 'var(--color-primary)' }}>Treatment</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    {selected.data.treatment.map((t, i) => <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>✓ {t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {plants.length === 0 && diseases.length === 0 && !loading && (
          <div className="alert alert-info mt-6">
            <span>ℹ️</span>
            <div>Database is empty. Run <code>python seed.py</code> in the backend directory to populate plant and disease data.</div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: var(--sp-6); }
        .modal-box { max-width: 620px; width: 100%; max-height: 80vh; overflow-y: auto; padding: var(--sp-8); position: relative; }
        .modal-close { position: absolute; top: var(--sp-4); right: var(--sp-4); background: var(--bg-card); border: 1px solid var(--border); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; font-size: 1rem; transition: all var(--t-fast); }
        .modal-close:hover { color: var(--text-primary); border-color: var(--border-hover); }
      `}</style>
    </div>
  );
}
