import { ensureAuth, clearToken, getUserFromToken } from './auth.js';
const API_HOST = 'http://localhost:3000';
const token = ensureAuth();    // redirects to login.html if not logged in

const payload = JSON.parse(atob(token.split('.')[1]));
const userId  = payload.id;

async function loadDashboard() {
  const res = await fetch(`${API_HOST}/api/users/${userId}`, {
    headers: { 
      'Authorization': 'Bearer ' + token 
    }
  });
  if (!res.ok) {
    return alert('Failed to load profile');
  }
  const user = await res.json();
  document.getElementById('displayUsername').textContent = user.username;
  document.getElementById('displayRole').textContent     = user.role;
}

// Wire up logout:
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  clearToken();
  window.location.href = 'login.html';
});

loadDashboard();