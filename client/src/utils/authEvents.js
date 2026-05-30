/**
 * authEvents.js — lightweight custom event bus for auth state changes.
 *
 * Using window.dispatchEvent / window.addEventListener lets us signal
 * a forced logout from anywhere (e.g., the axios interceptor) WITHOUT
 * importing React Router's navigate, which cannot be called outside a
 * component tree. The App-level listener picks this up and navigates
 * cleanly — no hard page reload, no SPA state wipe.
 */

export const AUTH_LOGOUT_EVENT = 'auth:force-logout';

/** Dispatch a forced logout signal. Safe to call from any module. */
export const dispatchForceLogout = () => {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
};

/** Subscribe to forced logout. Returns an unsubscribe function. */
export const onForceLogout = (callback) => {
  window.addEventListener(AUTH_LOGOUT_EVENT, callback);
  return () => window.removeEventListener(AUTH_LOGOUT_EVENT, callback);
};
