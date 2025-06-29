import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// Ensure user is logged in
ensureAuth();
const token = getToken();

// Handle file upload
document.getElementById('case4Form').addEventListener('submit', async e => {
  e.preventDefault();

  const fileInput = document.getElementById('case4File');
  const file = fileInput.files[0];
  if (!file) {
    return alert('Please select a PDF to upload.');
  }

  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const res = await fetch(`${API}/forms/upload`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    alert('✅ Case 4 submitted successfully!');
    window.location.href = 'submit.html';
  } catch (err) {
    alert('Submission failed: ' + err.message);
  }
});