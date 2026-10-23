import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { historyApi } from '../services/api';

export default function History() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = search
        ? await historyApi.search(search)
        : await historyApi.list(0, 50);
      setData(res.data.data || []);
      setTotal(res.data.total || res.data.count || 0);
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSearch = e => { e.preventDefault(); fetchHistory(); };

  const handleDelete = async id => {
    if (!confirm('Delete this diagnosis record?')) return;
    setDeleting(id);
    try {
      await historyApi.delete(id);
      setData(d => d.filter(x => (x.id || x._id) !== id));
      setTotal(t => t - 1);
    } catch {} finally { setDeleting(null); }
  };

  const fmt = dt => new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <div className="page">
      <div className="container">
        <div className="page-hero">
          <span className="section-label">My Records</span>
          <h1>Diagnosis History</h1>
          <p>Track all your plant diagnoses with search and filter capabilities.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              id="history-search"
              placeholder="Search by plant or disease…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          {search && <button type="button" className="btn btn-outline" onClick={() => { setSearch(''); }}>Clear</button>}
        </form>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 'var(--sp-4)' }}>
          {total} record{total !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No diagnoses yet</h3>
            <p style={{ margin: 'var(--sp-3) 0 var(--sp-6)' }}>Start by diagnosing a plant leaf image.</p>
            <Link to="/diagnose" className="btn btn-primary">🌿 Diagnose Now</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Disease</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id || d._id}>
                    <td style={{ fontWeight: 700 }}>{d.plant}</td>
                    <td>{d.disease}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: d.confidence >= 0.8 ? 'var(--color-primary)' : d.confidence >= 0.6 ? 'var(--color-accent)' : 'var(--error)' }}>
                        {(d.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.is_healthy ? 'badge-green' : 'badge-amber'}`}>
                        {d.is_healthy ? '✅ Healthy' : '🦠 Disease'}
                      </span>
                    </td>
                    <td>{fmt(d.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <Link to={`/results/${d.id || d._id}`} className="btn btn-outline btn-sm">View</Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(d.id || d._id)}
                          disabled={deleting === (d.id || d._id)}
                        >
                          {deleting === (d.id || d._id) ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
