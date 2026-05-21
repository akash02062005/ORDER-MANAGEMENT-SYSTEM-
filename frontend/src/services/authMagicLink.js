import api from './api';

export const requestMagicLink = (email) =>
  api.post('/auth/magic-link/request', { email }).then((r) => r.data);

export const verifyMagicLink = (token) =>
  api.post('/auth/magic-link/verify', { token }).then((r) => r.data);
