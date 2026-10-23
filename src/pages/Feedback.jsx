import { useState } from 'react';
import { Link } from 'react-router-dom';
import { feedbackApi } from '../services/api';
import './Feedback.css';

const CATEGORIES = [
  { value: 'diagnosis', label: 'Diagnosis result', description: 'Accuracy, clarity, or care suggestions' },
  { value: 'website', label: 'Website experience', description: 'Navigation, design, or ease of use' },
  { value: 'bug_report', label: 'Report a problem', description: 'Something is not working as expected' },
  { value: 'feature_request', label: 'Suggest an idea', description: 'A tool or improvement you would like' },
  { value: 'general', label: 'Something else', description: 'Any other thoughts for our team' },
];

const RATING_LABELS = {
  1: 'Not good',
  2: 'Could be better',
  3: 'It was okay',
  4: 'Good experience',
  5: 'Excellent',
};

const EMPTY_FORM = { category: 'general', rating: 5, message: '', diagnosis_id: '' };

export default function Feedback() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const message = form.message.trim();
    if (!message) {
      setError('Please add a message before sending your feedback.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await feedbackApi.submit({
        ...form,
        message,
        diagnosis_id: form.diagnosis_id.trim() || undefined,
      });
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail
        || requestError.message
        || 'We could not send your feedback. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <main className="feedback-page">
        <section className="feedback-success">
          <span className="feedback-success-kicker">NOTE RECEIVED</span>
          <div className="feedback-success-mark" aria-hidden="true">✓</div>
          <h1>Thank you for helping us grow.</h1>
          <p>Your thoughts have been shared with the AgriDiag team. We appreciate you taking the time to make plant care better for everyone.</p>
          <div className="feedback-success-actions">
            <button type="button" className="btn btn-primary" onClick={resetForm}>Send another note</button>
            <Link to="/dashboard" className="feedback-back-link">Back to your dashboard</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="feedback-page">
      <div className="feedback-layout">
        <header className="feedback-intro">
          <span className="feedback-eyebrow">A NOTE TO THE TEAM</span>
          <h1>Help us grow a better AgriDiag.</h1>
          <p>Tell us what’s working, what needs attention, or what would make your next plant check more useful.</p>
          <div className="feedback-aside">
            <span className="feedback-aside-rule" aria-hidden="true" />
            <p>Every thoughtful note helps us make plant care more useful for growers and agricultural professionals.</p>
          </div>
          <span className="feedback-page-number" aria-hidden="true">01 / YOUR FEEDBACK</span>
        </header>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-header">
            <div>
              <span className="feedback-eyebrow">SHARE YOUR THOUGHTS</span>
              <h2>Your feedback</h2>
            </div>
            <span className="feedback-required-note"><span aria-hidden="true">*</span> Required</span>
          </div>

          {error && (
            <div className="feedback-error" role="alert">
              <span className="feedback-error-mark" aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          <fieldset className="feedback-fieldset">
            <legend>
              <span className="feedback-step">01</span>
              What is your note about?
              <span className="feedback-required" aria-hidden="true">*</span>
            </legend>
            <div className="feedback-categories">
              {CATEGORIES.map((category, index) => (
                <label
                  className={`feedback-category ${form.category === category.value ? 'is-selected' : ''}`}
                  key={category.value}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={form.category === category.value}
                    onChange={event => updateForm('category', event.target.value)}
                  />
                  <span className="feedback-category-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="feedback-category-copy">
                    <strong>{category.label}</strong>
                    <small>{category.description}</small>
                  </span>
                  <span className="feedback-category-check" aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="feedback-fieldset feedback-rating-field">
            <legend>
              <span className="feedback-step">02</span>
              How was your experience?
              <span className="feedback-required" aria-hidden="true">*</span>
            </legend>
            <div className="feedback-rating-control" role="radiogroup" aria-label="Rate your experience">
              {[1, 2, 3, 4, 5].map(rating => (
                <label className="feedback-rating-option" key={rating}>
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={form.rating === rating}
                    onChange={() => updateForm('rating', rating)}
                    aria-label={`${rating} out of 5: ${RATING_LABELS[rating]}`}
                  />
                  <span aria-hidden="true">{rating}</span>
                </label>
              ))}
              <span className="feedback-rating-label" aria-live="polite">
                {RATING_LABELS[form.rating]}
              </span>
            </div>
          </fieldset>

          <div className="feedback-field feedback-message-field">
            <label htmlFor="feedback-message">
              <span className="feedback-step">03</span>
              Tell us a little more
              <span className="feedback-required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="feedback-message"
              rows={5}
              placeholder="What happened? What did you find helpful? What could be better?"
              value={form.message}
              onChange={event => updateForm('message', event.target.value)}
              maxLength={5000}
              required
            />
            <span className="feedback-character-count">{form.message.length} / 5000</span>
          </div>

          <div className="feedback-field feedback-diagnosis-field">
            <label htmlFor="feedback-diagnosis">
              <span className="feedback-step">04</span>
              Related diagnosis ID <span className="feedback-optional">(optional)</span>
            </label>
            <input
              id="feedback-diagnosis"
              type="text"
              maxLength={36}
              placeholder="Add a result ID if your note is about a diagnosis"
              value={form.diagnosis_id}
              onChange={event => updateForm('diagnosis_id', event.target.value)}
            />
          </div>

          <div className="feedback-submit-row">
            <p>Your feedback is sent securely to our team.</p>
            <button type="submit" className="btn btn-primary" disabled={loading} id="feedback-submit">
              {loading ? <><span className="spinner spinner-sm" /> Sending note…</> : 'Send feedback'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
