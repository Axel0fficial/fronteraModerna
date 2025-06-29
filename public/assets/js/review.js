import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// Guard page
ensureAuth();
const token = getToken();

// Elements
const statusFilter = document.getElementById('statusFilter');
const userFilter   = document.getElementById('userFilter');
const tbody         = document.querySelector('#bundlesTable tbody');

// Load & render bundles
async function loadBundles() {
  // Fetch all bundles (moderator/admin)
  const res = await fetch(`${API}/bundles`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const bundles = await res.json();

  // Apply filters
  const statusVal = statusFilter.value;
  const userVal   = userFilter.value.toLowerCase();
  const filtered = bundles.filter(b => {
    const matchesStatus = !statusVal || b.status === statusVal;
    const matchesUser   = !userVal || b.submittedBy.username.toLowerCase().includes(userVal);
    return matchesStatus && matchesUser;
  });

  // Render rows
  tbody.innerHTML = '';
  filtered.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.submittedBy.username}</td>
      <td>${new Date(b.submittedAt).toLocaleDateString()}</td>
      <td>${b.status}</td>
      <td><button data-id="${b.id}">Review</button></td>
    `;
    // Review button navigates to detail page
    tr.querySelector('button').addEventListener('click', () => {
      window.location.href = `bundle.html?id=${b.id}`;
    });
    tbody.appendChild(tr);
  });
}

// Event listeners
statusFilter.addEventListener('change', loadBundles);
userFilter.addEventListener('input', loadBundles);

// Initial load
loadBundles();