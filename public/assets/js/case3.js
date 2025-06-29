import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// Guard page
ensureAuth();
const token = getToken();

// Handle Case 3 form submission
document.getElementById('case3Form').addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    nationalId:    document.getElementById('nationalId').value.trim(),
    vehiclePlate:  document.getElementById('vehiclePlate').value.trim(),
    chassisId:     document.getElementById('chassisId').value.trim()
  };

  const res = await fetch(`${API}/cases/3/submit`, {  // adjust endpoint as needed
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('✅ Case 3 submitted successfully!');
    window.location.href = 'submit.html';
  } else {
    const err = await res.json();
    alert('Submission failed: ' + (err.error || res.statusText));
  }
});