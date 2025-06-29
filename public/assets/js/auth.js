// auth.js
const TOKEN_KEY = 'authToken';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

// If you need user info from the token:
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload; // { id, role, ... }
}

// Call at top of every protected page:
export function ensureAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return null;
  }
  return getToken();
}
