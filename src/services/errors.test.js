import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMalformedResponseError,
  getFriendlyErrorMessage,
} from './errors.js';

test('maps server and validation responses without exposing response details', () => {
  const serverError = getFriendlyErrorMessage({
    response: {
      status: 500,
      data: { detail: 'Traceback at /srv/private/app.py: database password failed' },
    },
  });
  const validationError = getFriendlyErrorMessage({
    response: { status: 422, data: { detail: [{ msg: 'unexpected raw validation body' }] } },
  });

  assert.equal(serverError, 'Something went wrong on our end. Please try again shortly.');
  assert.equal(validationError, 'Please check the highlighted fields and correct the information.');
  assert.doesNotMatch(serverError, /500|Traceback|private|password/);
});

test('maps auth, upload, diagnosis, network, and malformed-response errors', () => {
  assert.equal(
    getFriendlyErrorMessage({ response: { status: 401 }, config: { url: '/auth/login' } }),
    'Incorrect email or password. Please try again.',
  );
  assert.equal(
    getFriendlyErrorMessage({ response: { status: 503, data: { code: 'MODEL_UNAVAILABLE' } } }, 'diagnosis'),
    'Plant disease analysis is temporarily unavailable. Please try again later.',
  );
  assert.equal(
    getFriendlyErrorMessage({ response: { status: 400, data: { code: 'INVALID_IMAGE' } } }, 'diagnosis'),
    "We couldn't read this image. Please choose a clear JPEG or PNG image.",
  );
  assert.equal(
    getFriendlyErrorMessage({ code: 'ERR_NETWORK' }),
    'Unable to connect. Please check your internet connection and try again.',
  );
  assert.equal(
    getFriendlyErrorMessage(createMalformedResponseError()),
    'We received an unexpected response. Please try again shortly.',
  );
  assert.equal(
    getFriendlyErrorMessage(new Error('internal implementation detail')),
    'Something unexpected happened. Please try again.',
  );
});
