import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { diagnosisApi } from '../services/api';
import { getFriendlyErrorMessage } from '../services/errors';
import './Results.css';

const RECOMMENDATION_TABS = [
  { id: 'treatment', label: 'Treatment' },
  { id: 'prevention', label: 'Prevention' },
  { id: 'management', label: 'Ongoing care' },
];

function ConfidenceMeter({ value }) {
  const confidence = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  const percentage = Math.round(confidence * 100);
  const confidenceLabel = percentage >= 80 ? 'High' : percentage >= 60 ? 'Moderate' : 'Low';

  return (
    <section className="results-confidence" aria-label={`Model confidence: ${percentage} percent`}>
      <div className="results-confidence-heading">
        <span className="results-eyebrow">MODEL CONFIDENCE</span>
        <span className={`results-confidence-label results-confidence-label--${confidenceLabel.toLowerCase()}`}>
          {confidenceLabel}
        </span>
      </div>
      <div className="results-confidence-value">{percentage}<span>%</span></div>
      <div
        className="results-confidence-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Model confidence"
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <p>This score reflects the model’s confidence, not a guarantee. Check the plant and symptoms before acting.</p>
    </section>
  );
}

function DetailList({ title, items, kind }) {
  if (!items?.length) return null;

  return (
    <section className={`results-detail results-detail--${kind}`}>
      <span className="results-eyebrow">{kind === 'symptoms' ? 'WHAT TO LOOK FOR' : 'POSSIBLE FACTORS'}</span>
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={`${kind}-${index}`}>
            <span className="results-list-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Results() {
  const { id } = useParams();
  const { state } = useLocation();
  const stateDiagnosis = state?.diagnosis;
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('treatment');

  useEffect(() => {
    let isCurrent = true;
    const suppliedDiagnosis = stateDiagnosis?.id === id ? stateDiagnosis : null;

    setDiagnosis(suppliedDiagnosis);
    setError('');
    setActiveTab('treatment');

    if (suppliedDiagnosis) {
      setLoading(false);
      return () => { isCurrent = false; };
    }

    if (!id) {
      setLoading(false);
      setError('This diagnosis link is missing its result ID.');
      return () => { isCurrent = false; };
    }

    setLoading(true);
    diagnosisApi.getById(id)
      .then(response => {
        if (isCurrent) setDiagnosis(response.data);
      })
      .catch(requestError => {
        if (!isCurrent) return;
        setError(getFriendlyErrorMessage(requestError, 'results'));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => { isCurrent = false; };
  }, [id, stateDiagnosis]);

  if (loading) {
    return (
      <main className="results-page">
        <div className="results-state" role="status">
          <div className="spinner spinner-lg" />
          <p>Preparing your plant health report…</p>
        </div>
      </main>
    );
  }

  if (!diagnosis) {
    return (
      <main className="results-page">
        <div className="results-state results-state--empty">
          <span className="results-eyebrow">REPORT UNAVAILABLE</span>
          <h1>{error ? 'We couldn’t load this report.' : 'Diagnosis not found'}</h1>
          {error && <p role="alert">{error}</p>}
          <Link to="/diagnose" className="btn btn-primary">Start a new diagnosis</Link>
          <Link to="/history" className="results-text-link">Go to diagnosis history</Link>
        </div>
      </main>
    );
  }

  const d = diagnosis;
  const recommendation = d[activeTab];
  const recommendationItems = Array.isArray(recommendation) ? recommendation : [];

  return (
    <main className="results-page">
      <div className="results-container">
        <header className="results-header">
          <div>
            <span className="results-eyebrow">YOUR PLANT HEALTH REPORT</span>
            <h1>A clearer picture of your plant.</h1>
            <p>Review the result, compare it with what you see, then choose a considered next step.</p>
          </div>
          <Link to="/diagnose" className="results-new-link">Start another check <span aria-hidden="true">↗</span></Link>
        </header>

        {d.is_low_confidence && (
          <div className="results-notice results-notice--caution" role="status">
            <span className="results-notice-mark" aria-hidden="true">!</span>
            <div>
              <strong>This result needs a closer look</strong>
              <p>{d.low_confidence_warning || 'The model is not sufficiently confident. Try a clearer photo or ask an agricultural expert to confirm the diagnosis.'}</p>
            </div>
          </div>
        )}

        {d._mock && (
          <div className="results-notice results-notice--demo" role="status">
            <span className="results-notice-mark" aria-hidden="true">i</span>
            <p>Demo prediction: this result was generated without live model inference.</p>
          </div>
        )}

        <section className="results-overview" aria-labelledby="results-disease">
          <div className="results-image-wrap">
            {d.image_url ? (
              <img
                src={d.image_url}
                alt={`Uploaded ${d.plant} photo used for diagnosis`}
                className="results-image"
                onError={event => { event.currentTarget.hidden = true; }}
              />
            ) : (
              <div className="results-image-placeholder" aria-label="No plant photo available">
                <span>IMAGE NOT AVAILABLE</span>
              </div>
            )}
            <span className="results-photo-caption">YOUR UPLOADED PHOTO</span>
          </div>

          <div className="results-summary">
            <span className="results-eyebrow">PLANT IDENTIFIED</span>
            <p className="results-plant-name">{d.plant}</p>
            <span className={`results-status ${d.is_healthy ? 'results-status--healthy' : 'results-status--attention'}`}>
              <span aria-hidden="true" />
              {d.is_healthy ? 'No disease detected' : 'Needs attention'}
            </span>
            <h2 id="results-disease">{d.disease}</h2>
            {d.description && <p className="results-description">{d.description}</p>}
            <p className="results-disclaimer">An AI-assisted suggestion, not a substitute for expert diagnosis.</p>
          </div>

          <ConfidenceMeter value={d.confidence} />
        </section>

        {(d.symptoms?.length > 0 || d.causes?.length > 0) && (
          <div className="results-details">
            <DetailList title="Visible signs" items={d.symptoms} kind="symptoms" />
            <DetailList title="What may be contributing" items={d.causes} kind="causes" />
          </div>
        )}

        <section className="results-recommendations" aria-labelledby="recommendations-title">
          <div className="results-section-heading">
            <div>
              <span className="results-eyebrow">A PRACTICAL NEXT STEP</span>
              <h2 id="recommendations-title">Care guidance</h2>
            </div>
            <p>Use these suggestions as a starting point and follow local agricultural guidance.</p>
          </div>

          <div className="results-tabs" role="tablist" aria-label="Plant care guidance">
            {RECOMMENDATION_TABS.map(tab => (
              <button
                key={tab.id}
                id={`results-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="results-tab-panel"
                className={activeTab === tab.id ? 'is-active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="results-guidance"
            id="results-tab-panel"
            role="tabpanel"
            aria-labelledby={`results-tab-${activeTab}`}
            tabIndex="0"
          >
            {activeTab === 'management' ? (
              <p>{d.management || 'No ongoing care notes are available for this result.'}</p>
            ) : recommendationItems.length ? (
              <ol>
                {recommendationItems.map((item, index) => (
                  <li key={`${activeTab}-${index}`}>
                    <span className="results-guidance-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No {activeTab} guidance is available for this result.</p>
            )}
          </div>
        </section>

        <footer className="results-footer">
          <div>
            <span className="results-eyebrow">KEEP CARING FOR YOUR GARDEN</span>
            <p>Save this report in your history or check another plant.</p>
          </div>
          <div className="results-actions">
            <Link to="/history" className="btn btn-outline">View history</Link>
            <Link to="/feedback" className="results-feedback-link">Share feedback</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
