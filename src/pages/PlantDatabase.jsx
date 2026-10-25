import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { plantsApi } from '../services/api';
import { getFriendlyErrorMessage } from '../services/errors';
import './PlantDatabase.css';

const LIBRARY_TABS = [
  { id: 'plants', label: 'Plants' },
  { id: 'diseases', label: 'Diseases' },
];

const PLANT_IMAGES = [
  'photo-1497250681960-ef046c08a56e',
  'photo-1501004318641-b39e6451bec6',
  'photo-1464226184884-fa280b87c399',
  'photo-1592841200221-a6898f307baa',
];

const DISEASE_IMAGES = [
  'photo-1518531933037-91b2f5f229cc',
  'photo-1416879595882-3373a0480b5b',
  'photo-1470058869958-2a77ade41c02',
  'photo-1497250681960-ef046c08a56e',
];

function getImageUrl(item, type, index = 0) {
  if (item.image_url) return item.image_url;
  const images = type === 'plant' ? PLANT_IMAGES : DISEASE_IMAGES;
  const image = images[index % images.length];
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=80`;
}

function getSeverityClass(severity = '') {
  const normalized = severity.toLowerCase();
  if (normalized === 'high' || normalized === 'severe') return 'severity-high';
  if (normalized === 'medium' || normalized === 'moderate') return 'severity-medium';
  return 'severity-low';
}

function DetailSection({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="library-detail-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PlantDatabase() {
  const [plants, setPlants] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [totals, setTotals] = useState({ plants: 0, diseases: 0 });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('plants');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const closeButtonRef = useRef(null);

  const loadLibrary = useCallback(async (tab = activeTab, query = '') => {
    setLoading(true);
    setError('');
    try {
      const response = tab === 'plants'
        ? await plantsApi.list(query, 0, 100)
        : await plantsApi.listDiseases(query, 0, 100);
      const data = response.data.data || [];
      if (tab === 'plants') {
        setPlants(data);
        if (!query) setTotals(current => ({ ...current, plants: response.data.total ?? data.length }));
      } else {
        setDiseases(data);
        if (!query) setTotals(current => ({ ...current, diseases: response.data.total ?? data.length }));
      }
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError, 'library'));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const loadInitialLibrary = async () => {
      setLoading(true);
      setError('');
      try {
        const [plantResponse, diseaseResponse] = await Promise.all([
          plantsApi.list('', 0, 100),
          plantsApi.listDiseases('', 0, 100),
        ]);
        const plantData = plantResponse.data.data || [];
        const diseaseData = diseaseResponse.data.data || [];
        setPlants(plantData);
        setDiseases(diseaseData);
        setTotals({
          plants: plantResponse.data.total ?? plantData.length,
          diseases: diseaseResponse.data.total ?? diseaseData.length,
        });
      } catch (requestError) {
        setError(getFriendlyErrorMessage(requestError, 'library'));
      } finally {
        setLoading(false);
      }
    };
    loadInitialLibrary();
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    closeButtonRef.current?.focus();
    const closeOnEscape = event => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [selected]);

  const handleSearch = event => {
    event.preventDefault();
    loadLibrary(activeTab, search.trim());
  };

  const changeTab = tab => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearch('');
    setError('');
    loadLibrary(tab);
  };

  const activeItems = activeTab === 'plants' ? plants : diseases;
  const activeTotal = totals[activeTab];
  const itemType = activeTab === 'plants' ? 'plant' : 'disease';

  return (
    <main className="library-page">
      <section className="library-hero">
        <div className="library-hero-inner">
          <span className="library-eyebrow">THE AGRIDIAG REFERENCE LIBRARY</span>
          <h1>Know what<br />you’re growing.</h1>
          <p>
            A practical guide to the crops you care for and the plant health challenges
            worth keeping an eye on.
          </p>
          <a className="library-hero-link" href="#library-browser">
            Explore the library <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="library-hero-image">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1500&q=85"
            alt="Rows of fresh crops growing in a field"
            fetchpriority="high"
          />
          <span>FIELD GUIDE&nbsp; / &nbsp;PLANT HEALTH</span>
        </div>
        <div className="library-hero-index" aria-hidden="true">01<br />FIELD NOTES</div>
      </section>

      <section className="library-browser" id="library-browser">
        <div className="library-browser-inner">
          <header className="library-browser-heading">
            <div>
              <span className="library-eyebrow">EXPLORE THE COLLECTION</span>
              <h2>Find what you need.</h2>
            </div>
            <Link to="/diagnose" className="library-diagnose-link">
              Check a leaf <span aria-hidden="true">↗</span>
            </Link>
          </header>

          <div className="library-controls">
            <div className="library-tabs" role="tablist" aria-label="Library category">
              {LIBRARY_TABS.map(tab => {
                const count = totals[tab.id];
                return (
                  <button
                    type="button"
                    role="tab"
                    key={tab.id}
                    id={`library-tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls="library-results"
                    className={`library-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                    onClick={() => changeTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <span className="library-tab-count">{loading ? '—' : count}</span>
                  </button>
                );
              })}
            </div>

            <form className="library-search" onSubmit={handleSearch} role="search">
              <span className="library-search-icon" aria-hidden="true" />
              <label className="library-visually-hidden" htmlFor="plant-search">
                Search plants and diseases
              </label>
              <input
                id="plant-search"
                type="search"
                value={search}
                placeholder={`Search ${activeTab}…`}
                onChange={event => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="library-clear-search"
                  onClick={() => {
                    setSearch('');
                    loadLibrary(activeTab);
                  }}
                >
                  Clear
                </button>
              )}
              <button className="library-search-submit" type="submit">Search</button>
            </form>
          </div>

          <div id="library-results" role="tabpanel" aria-labelledby={`library-tab-${activeTab}`}>
            <div className="library-results-heading">
              <span>{search.trim() ? activeItems.length : activeTotal} {activeTab === 'plants' ? 'plant profiles' : 'disease guides'}</span>
              {search.trim() && <span>Results for “{search.trim()}”</span>}
            </div>

            {loading ? (
              <div className="library-loading" role="status">
                <span className="library-loading-mark" />
                <span>Gathering the field notes…</span>
              </div>
            ) : error ? (
              <div className="library-empty-state" role="alert">
                <span className="library-eyebrow">LIBRARY UNAVAILABLE</span>
                <h3>We couldn’t open the collection.</h3>
                <p>{error}</p>
                <button type="button" className="library-retry-button" onClick={() => loadLibrary(activeTab, search.trim())}>
                  Try again
                </button>
              </div>
            ) : activeItems.length === 0 ? (
              <div className="library-empty-state">
                <span className="library-eyebrow">{search.trim() ? 'NO MATCHES FOUND' : 'COLLECTION EMPTY'}</span>
                <h3>{search.trim() ? 'Try a different search.' : `No ${activeTab} in the collection yet.`}</h3>
                <p>
                  {search.trim()
                    ? 'Search by crop name, disease, or scientific name.'
                    : 'Reference entries will appear here once they have been added.'}
                </p>
                {search.trim() && (
                  <button
                    type="button"
                    className="library-retry-button"
                    onClick={() => {
                      setSearch('');
                      loadLibrary(activeTab);
                    }}
                  >
                    Show all {activeTab}
                  </button>
                )}
              </div>
            ) : (
              <div className={`library-grid ${activeTab === 'diseases' ? 'disease-grid' : ''}`}>
                {activeItems.map((item, index) => (
                  <button
                    type="button"
                    key={item.id || item._id}
                    className="library-card"
                    onClick={() => setSelected({ type: itemType, data: item, index })}
                    aria-label={`View ${item.name} ${itemType} details`}
                  >
                    <span className="library-card-image">
                      <img src={getImageUrl(item, itemType, index)} alt="" loading="lazy" />
                      <span className="library-card-number">{String(index + 1).padStart(2, '0')}</span>
                      {itemType === 'disease' && item.severity && (
                        <span className={`library-severity ${getSeverityClass(item.severity)}`}>
                          {item.severity} severity
                        </span>
                      )}
                    </span>
                    <span className="library-card-content">
                      <span className="library-card-type">{itemType === 'plant' ? 'PLANT PROFILE' : 'DISEASE GUIDE'}</span>
                      <strong className="library-card-title">{item.name}</strong>
                      {itemType === 'plant' && item.scientific_name && (
                        <span className="library-scientific-name">{item.scientific_name}</span>
                      )}
                      <span className="library-card-description">
                        {item.description || 'Open this entry to explore plant health information and care guidance.'}
                      </span>
                      <span className="library-card-tags">
                        {(itemType === 'plant' ? item.diseases : item.affected_plants)?.slice(0, 2).map(tag => (
                          <span key={tag}>{tag}</span>
                        ))}
                        {(itemType === 'plant' ? item.diseases : item.affected_plants)?.length > 2 && (
                          <span>+{(itemType === 'plant' ? item.diseases : item.affected_plants).length - 2}</span>
                        )}
                      </span>
                      <span className="library-card-open">Explore profile <span aria-hidden="true">↗</span></span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selected && (
        <div className="library-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section
            className="library-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-modal-title"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="library-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              ×
            </button>
            <div className="library-modal-image">
              <img
                src={getImageUrl(selected.data, selected.type, selected.index)}
                alt=""
              />
              <span>{selected.type === 'plant' ? 'PLANT PROFILE' : 'DISEASE GUIDE'}</span>
            </div>
            <div className="library-modal-content">
              <span className="library-eyebrow">
                {selected.type === 'plant' ? 'FROM THE PLANT LIBRARY' : 'FROM THE DISEASE LIBRARY'}
              </span>
              <h2 id="library-modal-title">{selected.data.name}</h2>
              {selected.data.scientific_name && (
                <p className="library-modal-scientific">{selected.data.scientific_name}</p>
              )}
              {selected.type === 'disease' && selected.data.severity && (
                <span className={`library-severity modal-severity ${getSeverityClass(selected.data.severity)}`}>
                  {selected.data.severity} severity
                </span>
              )}
              {selected.data.description && <p className="library-modal-description">{selected.data.description}</p>}
              {selected.data.affected_plants?.length > 0 && (
                <div className="library-affected-plants">
                  <h3>Affected plants</h3>
                  <div>{selected.data.affected_plants.map(plant => <span key={plant}>{plant}</span>)}</div>
                </div>
              )}
              <DetailSection title="Symptoms" items={selected.data.symptoms} />
              <DetailSection title="Causes" items={selected.data.causes} />
              <DetailSection title="Treatment" items={selected.data.treatment} />
              <DetailSection title="Prevention" items={selected.data.prevention} />
              {selected.data.management && (
                <section className="library-detail-section">
                  <h3>Management</h3>
                  <p>{selected.data.management}</p>
                </section>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
