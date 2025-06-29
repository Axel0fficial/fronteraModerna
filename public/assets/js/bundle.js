import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api';

// Guard & extract token
ensureAuth();
const token = getToken();

// Parse bundle ID from URL
const params = new URLSearchParams(window.location.search);
const bundleId = params.get('id');

// Element refs
const elId      = document.getElementById('bundleId');
const elUser    = document.getElementById('bundleUser');
const elDate    = document.getElementById('bundleDate');
const elStatus  = document.getElementById('bundleStatus');
const elReason  = document.getElementById('bundleReason');
const reasonBlk = document.getElementById('rejectionReasonBlock');
const fileList  = document.getElementById('fileList');
const rawSection= document.getElementById('rawDataSection');
const rawDataEl = document.getElementById('rawData');
const approveBtn= document.getElementById('approveBtn');
const rejectBtn = document.getElementById('rejectBtn');
const rejectModal= document.getElementById('rejectModal');
const rejectClose= document.getElementById('rejectClose');
const cancelRejectBtn = document.getElementById('cancelRejectBtn');
const confirmRejectBtn= document.getElementById('confirmRejectBtn');
const rejectInput = document.getElementById('rejectReasonInput');

// Load bundle details
async function loadBundle() {
  const res = await fetch(`${API}/bundles/${bundleId}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const b = await res.json();

  elId.textContent     = b.id;
  elUser.textContent   = b.submittedBy.username;
  elDate.textContent   = new Date(b.submittedAt).toLocaleString();
  elStatus.textContent = b.status;

  // Show rejection reason if exists
  if (b.status === 'rejected' && b.rejectionReason) {
    reasonBlk.classList.remove('hidden');
    elReason.textContent = b.rejectionReason;
  }

  // List all PDFs (forms)
  fileList.innerHTML = '';
  b.Forms.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="${f.pdfUrl}" target="_blank">View Document #${f.id}</a>
    `;
    fileList.appendChild(li);
    // guardianCertificateUrl, if present
    if (f.guardianCertificateUrl) {
      const li2 = document.createElement('li');
      li2.innerHTML = `
        <a href="${f.guardianCertificateUrl}" target="_blank">
          View Guardian Consent
        </a>
      `;
      fileList.appendChild(li2);
    }
  });

  // Example raw data (if any) - adjust based on your model
  if (b.rawData && Object.keys(b.rawData).length) {
  rawSection.classList.remove('hidden');
  rawDataEl.innerHTML = '';  // clear any existing content

  // For each key/value pair, create a <p><strong>key:</strong> value</p>
  Object.entries(b.rawData).forEach(([key, value]) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${key}:</strong> ${value}`;
    rawDataEl.appendChild(p);
  });
}

}

// Approve action
approveBtn.addEventListener('click', async () => {
  await updateStatus('approved');
});

// Open reject modal
rejectBtn.addEventListener('click', () => {
  rejectModal.classList.remove('hidden');
});

// Close modal handlers
[rejectClose, cancelRejectBtn].forEach(el =>
  el.addEventListener('click', () => rejectModal.classList.add('hidden'))
);

// Confirm reject
confirmRejectBtn.addEventListener('click', async () => {
  const reason = rejectInput.value.trim();
  if (!reason) return alert('Please provide a rejection reason.');
  await updateStatus('rejected', reason);
});

// Update status helper
async function updateStatus(status, reason = '') {
  const res = await fetch(`${API}/bundles/${bundleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ status, reason })
  });
  if (res.ok) {
    alert(`Bundle ${status}`);
    window.location.href = 'review.html';
  } else {
    const err = await res.json();
    alert('Error: ' + (err.error || res.statusText));
  }
}

// Initialize
loadBundle();