// public/assets/js/case1.js
import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Guard and retrieve age
  const token = ensureAuth();
  const payload = JSON.parse(atob(token.split('.')[1]));
  const age = payload.age;

  // 2) Elements for under-18 flow
  const warning     = document.getElementById('underageWarning');
  const consentDiv  = document.getElementById('case1ConsentDiv');
  const consentInput= document.getElementById('case1Consent');

  // Show consent input and warning if user is under 18
  if (age < 18) {
    if (warning)     warning.classList.remove('hidden');
    if (consentDiv)  consentDiv.classList.remove('hidden');
    if (consentInput) consentInput.required = true;
  }

  // 3) Handle form submission
  const form = document.getElementById('case1Form');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Affidavit file
    const filledPdf = document.getElementById('case1FilledPdf').files[0];
    if (!filledPdf) {
      return alert('Please upload the completed affidavit.');
    }

    const formData = new FormData();
    formData.append('pdf', filledPdf);

    // Guardian certificate if underage
    if (age < 18) {
      const certFile = consentInput.files[0];
      if (!certFile) {
        return alert('Please upload the guardian consent form.');
      }
      formData.append('certificate', certFile);
    }

    // Upload to backend
    const res = await fetch(`${API}/forms/upload`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });

    if (res.ok) {
      alert('✅ Case 1 submitted successfully!');
      window.location.href = 'submit.html';
    } else {
      const err = await res.json();
      alert('Submission failed: ' + (err.error || res.statusText));
    }
  });
});
