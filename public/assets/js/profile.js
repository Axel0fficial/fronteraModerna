import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// guard
const token = ensureAuth();

// Elements
const tabEdit    = document.getElementById('tabEdit');
const tabHistory = document.getElementById('tabHistory');
const editSec    = document.getElementById('editSection');
const histSec    = document.getElementById('historySection');
const profileForm= document.getElementById('profileForm');
const msgBox     = document.getElementById('profileMsg');
const historyList= document.getElementById('caseHistoryList');

// Tab switching
tabEdit.addEventListener('click', () => switchTab('edit'));
tabHistory.addEventListener('click', () => switchTab('history'));

function switchTab(tab) {
  tab === 'edit'
    ? (tabEdit.classList.add('active'),
       tabHistory.classList.remove('active'),
       editSec.classList.remove('hidden'),
       histSec.classList.add('hidden'))
    : (tabHistory.classList.add('active'),
       tabEdit.classList.remove('active'),
       histSec.classList.remove('hidden'),
       editSec.classList.add('hidden'),
       loadHistory());
}

// Load current profile into form
async function loadProfile() {
  const payload = JSON.parse(atob(getToken().split('.')[1]));
  const res = await fetch(`${API}/users/${payload.id}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const u = await res.json();
  ['username','email','age','birthday','nationalId','passportNumber','passportExpiry']
    .forEach(f => document.getElementById('p_'+f).value = u[f] || '');
}
loadProfile();

// Handle profile updates
profileForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = JSON.parse(atob(getToken().split('.')[1]));
  const body = {
    username:       document.getElementById('p_username').value,
    email:          document.getElementById('p_email').value,
    age:            document.getElementById('p_age').value,
    birthday:       document.getElementById('p_birthday').value,
    nationalId:     document.getElementById('p_nationalId').value,
    passportNumber: document.getElementById('p_passportNumber').value,
    passportExpiry: document.getElementById('p_passportExpiry').value
  };
  const res = await fetch(`${API}/users/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    msgBox.textContent = '✅ Profile updated.';
    setTimeout(() => msgBox.textContent = '', 3000);
  } else {
    msgBox.textContent = '❌ Update failed.';
  }
});

// Load user’s case history
async function loadHistory() {
  historyList.innerHTML = '<li>Loading...</li>';
  const payload = JSON.parse(atob(getToken().split('.')[1]));
  const res = await fetch(`${API}/forms`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const forms = await res.json();
  // filter only this user’s forms
  const mine = forms.filter(f => f.submittedById === payload.id);
  historyList.innerHTML = mine.length
    ? mine.map(f => `<li>Case #${f.id} — ${f.status} — ${new Date(f.createdAt).toLocaleDateString()}</li>`).join('')
    : '<li>No submissions yet.</li>';
}
