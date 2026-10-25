import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogin,
  validateRegister,
  validateFeedback,
  isFormValid,
} from '../src/services/formValidation.js';

test('validateLogin catches missing or invalid credentials', () => {
  const invalid = validateLogin({ email: 'not-an-email', password: '' });
  assert.equal(isFormValid(invalid), false);
  assert.ok(invalid.email);
  assert.ok(invalid.password);

  const valid = validateLogin({ email: 'grower@example.com', password: 'securepassword123' });
  assert.equal(isFormValid(valid), true);
});

test('validateRegister catches weak passwords, invalid email, or missing name', () => {
  const invalid = validateRegister({ name: 'A', email: 'bad', password: '123', role: 'UNKNOWN' });
  assert.equal(isFormValid(invalid), false);
  assert.ok(invalid.name);
  assert.ok(invalid.email);
  assert.ok(invalid.password);
  assert.ok(invalid.role);

  const valid = validateRegister({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123', role: 'FARMER' });
  assert.equal(isFormValid(valid), true);
});

test('validateFeedback catches empty message or invalid rating', () => {
  const invalid = validateFeedback({ category: 'general', rating: 6, message: '   ', diagnosis_id: 'bad-uuid' });
  assert.equal(isFormValid(invalid), false);
  assert.ok(invalid.rating);
  assert.ok(invalid.message);
  assert.ok(invalid.diagnosis_id);

  const valid = validateFeedback({ category: 'diagnosis', rating: 5, message: 'Great tool!', diagnosis_id: '' });
  assert.equal(isFormValid(valid), true);
});
