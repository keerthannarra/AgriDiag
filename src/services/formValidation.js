// ── Shared frontend form validation ──────────────────────────────────────────
// Pure functions returning field-error maps ({ field: message }). Empty map = valid.
// Keep messages short and specific; they render beside the offending input.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ROLES = ['FARMER', 'SCIENTIST', 'AGRICULTURIST'];
export const FEEDBACK_CATEGORIES = ['diagnosis', 'website', 'bug_report', 'feature_request', 'general'];

function required(value, message) {
  return value && String(value).trim() ? '' : message;
}

export function validateLogin(form) {
  const errors = {};
  errors.email = required(form.email, 'Please enter your email address.')
    || (!EMAIL_RE.test(form.email) ? 'Please enter a valid email address.' : '');
  errors.password = required(form.password, 'Please enter your password.');
  return errors;
}

export function validateRegister(form) {
  const errors = {};
  const name = String(form.name || '').trim();
  errors.name = required(form.name, 'Please enter your name.')
    || (name.length < 2 ? 'Your name should be at least 2 characters.' : '')
    || (name.length > 100 ? 'Your name should be 100 characters or fewer.' : '');
  errors.email = required(form.email, 'Please enter your email address.')
    || (!EMAIL_RE.test(form.email) ? 'Please enter a valid email address.' : '');
  errors.password = required(form.password, 'Please create a password.')
    || (form.password.length < 6 ? 'Use at least 6 characters.' : '')
    || (form.password.length > 128 ? 'Your password should be 128 characters or fewer.' : '');
  errors.role = ROLES.includes(form.role) ? '' : 'Please choose a role.';
  return errors;
}

export function validateFeedback(form) {
  const errors = {};
  errors.category = FEEDBACK_CATEGORIES.includes(form.category)
    ? ''
    : 'Please choose a category.';
  const rating = Number(form.rating);
  errors.rating = Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? ''
    : 'Please choose a rating from 1 to 5.';
  const message = String(form.message || '').trim();
  errors.message = required(form.message, 'Please add a message before sending.')
    || (message.length > 5000 ? 'Your message should be 5000 characters or fewer.' : '');
  const diagnosisId = String(form.diagnosis_id || '').trim();
  errors.diagnosis_id = diagnosisId && !UUID_RE.test(diagnosisId)
    ? 'That diagnosis ID looks incorrect.'
    : '';
  return errors;
}

// Returns true when every field is clear.
export function isFormValid(errors) {
  return Object.values(errors).every(message => !message);
}