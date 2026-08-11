import { useState } from 'react';
import { feedbackApi } from '../services/api';

const CATEGORIES = [
  { value: 'diagnosis', label: '🔬 Diagnosis Feedback', desc: 'Feedback about a specific diagnosis result' },
  { value: 'website', label: '🌐 Website Feedback', desc: 'General feedback about the platform' },
  { value: 'bug_report', label: '🐛 Bug Report', desc: 'Report a technical issue or error' },
  { value: 'feature_request', label: '💡 Feature Request', desc: 'Suggest a new feature or improvement' },
  { value: 'general', label: '💬 General', desc: 'Other feedback or comments' },
];

export default function Feedback() {
  const [form, setForm] = useState({ category: 'general', rating: 5, message: '', diagnosis_id: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.message.trim()) { setError('Please write a message.'); return; }
    setLoading(true); setError('');
    try {
      await feedbackApi.submit({ ...form, diagnosis_id: form.diagnosis_id || undefined });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback. Please try again.');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
        <div className="card card-glass" style={{ padding: 'var(--sp-16)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-5)' }}>🎉</div>
          <h2 style={{ marginBottom: 'var(--sp-4)' }}>Thank you!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-8)' }}>Your feedback helps us improve AgriDiag for all farmers and agricultural professionals.</p>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ category: 'general', rating: 5, message: '', diagnosis_id: '' }); }}>
            Submit Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="page-hero">
          <span className="section-label">Help Us Improve</span>
          <h1>Share Your Feedback</h1>
          <p>Your feedback helps us make AgriDiag better for everyone.</p>
        </div>

        {error && <div className="alert alert-error mb-4"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit} className="card card-glass" style={{ padding: 'var(--sp-8)' }}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">Feedback type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {CATEGORIES.map(c => (
                <label key={c.value} className={`role-card ${form.category === c.value ? 'selected' : ''}`} style={{ cursor: 'pointer' }}>
                  <input type="radio" name="category" value={c.value} checked={form.category === c.value}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ display: 'none' }} />
                  <span style={{ fontWeight: 700 }}>{c.label}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: n }))}
                  style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                  ⭐
                </button>
              ))}
              <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: '0.85rem' }}>{form.rating}/5</span>
            </div>
          </div>

          {/* Message */}
          <div className="form-group">
            <label className="form-label" htmlFor="feedback-message">Your message</label>
            <textarea id="feedback-message" className="form-input form-textarea" rows={5}
              placeholder="Tell us what you think, what could be improved, or report an issue…"
              value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
          </div>

          {/* Optional diagnosis ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="feedback-diag">Related diagnosis ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="feedback-diag" type="text" className="form-input" placeholder="e.g. 64abc…"
              value={form.diagnosis_id} onChange={e => setForm(p => ({ ...p, diagnosis_id: e.target.value }))} />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.85rem' }} disabled={loading} id="feedback-submit">
            {loading ? <><span className="spinner spinner-sm" /> Submitting…</> : '⭐ Submit Feedback'}
          </button>
        </form>
      </div>
      <style>{`
        .role-card { display: flex; flex-direction: column; gap: 2px; padding: var(--sp-3) var(--sp-4); border: 1.5px solid var(--border); border-radius: var(--r-md); background: var(--bg-input); transition: all var(--t-fast); }
        .role-card:hover { border-color: var(--border-hover); }
        .role-card.selected { border-color: var(--color-primary); background: rgba(34,197,94,0.08); }
      `}</style>
    </div>
  );
}
