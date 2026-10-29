import client from './client';

/** POST /auth/signup — create account and receive JWT. */
export async function signup(payload) {
  const { data } = await client.post('/auth/signup', payload);
  return data;
}

/** POST /auth/login — authenticate and receive JWT. */
export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

/** GET /auth/me — current user (uses Bearer token from interceptor). */
export async function getMe() {
  const { data } = await client.get('/auth/me');
  return data;
}

/** POST /auth/forgot-password — ask for a 6-digit reset code. */
export async function forgotPassword(email) {
  const { data } = await client.post('/auth/forgot-password', { email });
  return data;
}

/** POST /auth/verify-reset-code — check a code without spending it. */
export async function verifyResetCode(email, code) {
  const { data } = await client.post('/auth/verify-reset-code', { email, code });
  return data;
}

/** POST /auth/reset-password — set a new password with a valid code. */
export async function resetPassword(email, code, newPassword, confirmPassword) {
  const { data } = await client.post('/auth/reset-password', {
    email,
    code,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return data;
}
