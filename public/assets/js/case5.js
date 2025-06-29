import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  // Guard & get age
  ensureAuth();
  const token   = getToken();
  const payload = JSON.parse(atob(token.split('.')[1]));
  const age     = payload.age;

  // Under-18 logic
  const noteDiv     = document.getElementById('underageNote');
  const consentDiv  = document.getElementById('case5ConsentDiv');
  const consentInput= document.getElementById('case5Consent');
  if (age < 18) {
    noteDiv.classList.remove('hidden');
    consentDiv.classList.remove('hidden');
    consentInput.required = true;
  }

  // Submission handler
  const form = document.getElementById('case5Form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const file = document.getElementById('case5Pdf').files[0];
    if (!file) return alert('Please upload the combined PDF.');

    const formData = new FormData();
    formData.append('pdf', file);
    if (age < 18) {
      const cert = consentInput.files[0];
      if (!cert) return alert('Please upload guardian consent PDF.');
      formData.append('certificate', cert);
    }

    const res = await fetch(`${API}/forms/upload`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });

    if (res.ok) {
      alert('✅ Case 5 submitted successfully!');
      window.location.href = 'submit.html';
    } else {
      const err = await res.json();
      alert('Submission failed: ' + (err.error || res.statusText));
    }
  });
});