import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// guard & grab token
ensureAuth();
const token = getToken();

// Listen for form submit
document.getElementById('case3Form').addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    nationalId:   document.getElementById('nationalId').value.trim(),
    vehiclePlate: document.getElementById('vehiclePlate').value.trim(),
    chassisId:    document.getElementById('chassisId').value.trim()
  };

  const res = await fetch(`${API}/cases/3/submit`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('✅ Case 3 submitted!');
    window.location.href = 'submit.html';
  } else {
    const err = await res.json().catch(() => ({}));
    alert('Failed: ' + (err.error || res.statusText));
  }
});
