import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { historyApi } from '../services/api';
import './History.css';

const PAGE_SIZE = 100;
const FILTERS = [
  { id: 'all', label: 'All records' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'healthy', label: 'Healthy' },
];

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function HistoryRecord({ record, deleting, onDelete }) {
  const id = record.id || record._id;
  const confidence = Number.isFinite(record.confidence)
    ? `${Math.round(record.confidence * 100)}%`
    : '—';

  return (
    <article className="history-record">
      <div className="history-record-photo">
        {record.image_url ? (
          <img
            src={record.image_url}
            alt={`${record.plant || 'Plant'} diagnosis`}
            onError={event => { event.currentTarget.hidden = true; }}
          />
        ) : null}
        <span className="history-photo-fallback" aria-hidden="true">PLANT</span>
      </div>

      <div className="history-record-main">
        <span className="history-record-plant">{record.plant || 'Plant not identified'}</span>
        <h2>{record.disease || 'Diagnosis result unavailable'}</h2>
        <span className="history-record-date">{formatDate(record.created_at)}</span>
      </div>

      <div className="history-record-result">
        <span className={`history-status ${record.is_healthy ? 'history-status--healthy' : 'history-status--attention'}`}>
          <span aria-hidden="true" />
          {record.is_healthy ? 'Healthy' : 'Needs attention'}
        </span>
        <span className="history-confidence">{confidence} <span>confidence</span></span>
      </div>

      <div className="history-record-actions">
        <Link to={`/results/${id}`} className="history-view-link" aria-label={`View ${record.plant || 'plant'} diagnosis`}>
          View report <span aria-hidden="true">↗</span>
        </Link>
        <button
          type="button"
          className="history-delete-button"
          onClick={() => onDelete(id)}
          disabled={deleting}
          aria-label={`Delete ${record.plant || 'plant'} diagnosis`}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default function History() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const fetchHistory = useCallback(async (activeSearch, isCurrent) => {
    setLoading(true);
    setError('');
    try {
      const response = activeSearch
        ? await historyApi.search(activeSearch)
        : await historyApi.list(0, PAGE_SIZE);
      if (!isCurrent()) return;
      setData(response.data.data || []);
      setTotal(response.data.total ?? response.data.count ?? 0);
    } catch (requestError) {
      if (!isCurrent()) return;
      setError(
        requestError.response?.data?.detail
        || requestError.message
        || 'We could not load your diagnosis history. Please try again.'
      );
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    fetchHistory(search, () => isCurrent);
    return () => { isCurrent = false; };
  }, [fetchHistory, reload, search]);

  const visibleRecords = useMemo(() => {
    if (activeFilter === 'healthy') return data.filter(record => record.is_healthy);
    if (activeFilter === 'attention') return data.filter(record => !record.is_healthy);
    return data;
  }, [activeFilter, data]);

  const healthyCount = data.filter(record => record.is_healthy).length;
  const attentionCount = data.length - healthyCount;

  const handleSearch = event => {
    event.preventDefault();
    setSearch(query.trim());
    setActiveFilter('all');
  };

  const clearSearch = () => {
    setQuery('');
    setSearch('');
    setActiveFilter('all');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this diagnosis record? This cannot be undone.')) return;
    setDeleting(id);
    setError('');
    try {
      await historyApi.delete(id);
      setData(records => records.filter(record => (record.id || record._id) !== id));
      setTotal(count => Math.max(0, count - 1));
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail
        || requestError.message
        || 'We could not delete this record. Please try again.'
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="history-page">
      <div className="history-container">
        <header className="history-header">
          <div>
            <span className="history-eyebrow">YOUR GROWING RECORD</span>
            <h1>A history of healthier growing.</h1>
            <p>Every check in one place. Revisit a report, notice changes, and keep your next step close.</p>
          </div>
          <Link to="/diagnose" className="history-new-link">New plant check <span aria-hidden="true">↗</span></Link>
        </header>

        <section className="history-stats" aria-label="Diagnosis history overview">
          <div className="history-stat history-stat--total">
            <span className="history-stat-label">TOTAL CHECKS</span>
            <strong>{total}</strong>
            <span className="history-stat-note">in your history</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-label">HEALTHY RESULTS</span>
            <strong>{healthyCount}</strong>
            <span className="history-stat-note">in {data.length} records shown</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-label">NEEDS ATTENTION</span>
            <strong>{attentionCount}</strong>
            <span className="history-stat-note">in {data.length} records shown</span>
          </div>
          <div className="history-stat-aside">
            <span className="history-eyebrow">A LITTLE CONTEXT</span>
            <p>Use reports as a guide, compare them with what you see, and seek local expert advice when needed.</p>
          </div>
        </section>

        <section className="history-archive" aria-labelledby="history-archive-title">
          <div className="history-archive-heading">
            <div>
              <span className="history-eyebrow">FIELD NOTES</span>
              <h2 id="history-archive-title">Your diagnosis archive</h2>
            </div>
            <span className="history-count">
              {search ? `${total} search result${total === 1 ? '' : 's'}` : `${total} record${total === 1 ? '' : 's'}`}
            </span>
          </div>

          <form className="history-search" onSubmit={handleSearch} role="search">
            <label className="history-search-field">
              <span className="history-search-label">Search your records</span>
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Try a plant or disease name"
                aria-label="Search by plant or disease"
              />
            </label>
            <button type="submit" className="btn btn-primary">Search records</button>
            {search && (
              <button type="button" className="history-clear-button" onClick={clearSearch}>Clear search</button>
            )}
          </form>

          <div className="history-filter-row">
            <div className="history-filters" role="group" aria-label="Filter diagnosis records">
              {FILTERS.map(filter => (
                <button
                  type="button"
                  key={filter.id}
                  aria-pressed={activeFilter === filter.id}
                  className={activeFilter === filter.id ? 'is-active' : ''}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                  <span>
                    {filter.id === 'all' ? data.length : filter.id === 'healthy' ? healthyCount : attentionCount}
                  </span>
                </button>
              ))}
            </div>
            {!search && total > data.length && (
              <span className="history-latest-note">Showing the latest {data.length}</span>
            )}
          </div>

          {error && (
            <div className="history-error" role="alert">
              <p>{error}</p>
              {!data.length && (
                <button type="button" onClick={() => setReload(value => value + 1)}>Try again</button>
              )}
            </div>
          )}

          {loading ? (
            <div className="history-loading" role="status">
              <div className="spinner spinner-lg" />
              <p>Gathering your plant notes…</p>
            </div>
          ) : visibleRecords.length ? (
            <div className="history-record-list">
              {visibleRecords.map(record => (
                <HistoryRecord
                  key={record.id || record._id}
                  record={record}
                  deleting={deleting === (record.id || record._id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : !error ? (
            <div className="history-empty">
              <span className="history-empty-index" aria-hidden="true">01</span>
              <span className="history-eyebrow">
                {search ? 'NO MATCHES FOUND' : data.length ? 'NOTHING IN THIS FILTER' : 'A FRESH START'}
              </span>
              <h3>
                {search
                  ? 'No records match that search.'
                  : data.length
                    ? 'No diagnoses in this group.'
                    : 'Your plant notes will live here.'}
              </h3>
              <p>
                {search
                  ? 'Try another plant or disease name, or clear your search to see every record.'
                  : data.length
                    ? 'Choose another category to browse your archive.'
                    : 'Run your first plant check and come back to review the result anytime.'}
              </p>
              {search ? (
                <button type="button" className="history-empty-link" onClick={clearSearch}>Clear search</button>
              ) : !data.length ? (
                <Link to="/diagnose" className="history-empty-link">Start a diagnosis <span aria-hidden="true">↗</span></Link>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
