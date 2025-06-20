const API_HOST = 'http://localhost:3000';
let authToken = null;
let userRole = null;
let currentUser = { id: null };

function initializeUI() {
  // Show header, nav, footer after login
  document.querySelector('header').style.display = 'block';
  document.querySelector('nav').style.display = 'flex';
  document.querySelector('footer').style.display = 'block';
}

function showSection(sectionId) {
  // Hide all sections within mainContent
  document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden'));
  // Show target section
  document.getElementById(sectionId).classList.remove('hidden');
  // Show or hide moderator/admin buttons
  document.querySelectorAll('.moderator').forEach(el => {
    el.classList.toggle('hidden', !(userRole === 'moderator' || userRole === 'admin'));
  });
  document.querySelectorAll('.admin').forEach(el => {
    el.classList.toggle('hidden', userRole !== 'admin');
  });
}

async function loginUser(username, password) {
  const res = await fetch(`${API_HOST}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    authToken = data.token;
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    userRole = payload.role;
    currentUser.id = payload.id;
    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayRole').textContent = userRole;
    initializeUI();
    showSection('dashboardSection');
  } else {
    document.getElementById('loginError').textContent = data.error;
  }
}

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  loginUser(
    document.getElementById('username').value,
    document.getElementById('password').value
  );
});


// Set up nav buttons
document.querySelectorAll('#navBar button[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sec = btn.getAttribute('data-section');
    if (sec === 'reviewSection') loadForms();
    if (sec === 'supportSection') loadTickets();
    if (sec === 'profileSection') loadProfile();
    if (sec === 'adminSection') loadUsers();
    showSection(sec);
  });
});
document.getElementById('logoutBtn').addEventListener('click', () => location.reload());

// Upload Form
document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fileInput = document.getElementById('pdfFile');
  const formData = new FormData();
  formData.append('pdf', fileInput.files[0]);
  const res = await fetch(`${API_HOST}/api/forms/upload`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + authToken },
    body: formData
  });
  document.getElementById('uploadMessage').textContent = res.ok ? 'Upload successful' : 'Upload failed';
});

// Review Forms
async function loadForms() {
  const res = await fetch(`${API_HOST}/api/forms`, {
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  const forms = await res.json();
  const tbody = document.querySelector('#formsTable tbody');
  tbody.innerHTML = '';
  forms.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.id}</td>
      <td>${f.submittedBy.username}</td>
      <td>${f.status}</td>
      <td>${f.status==='pending'? `<button onclick="updateStatus(${f.id}, 'approved')">Approve</button><button onclick="updateStatus(${f.id}, 'rejected')">Reject</button>` : ''}</td>
    `;
    tbody.appendChild(tr);
  });
}
async function updateStatus(id, status) {
  await fetch(`${API_HOST}/api/forms/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json','Authorization': 'Bearer ' + authToken },
    body: JSON.stringify({ status })
  });
  loadForms();
}

// Support Tickets
document.getElementById('supportForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = document.getElementById('supportMessage').value;
  await fetch(`${API_HOST}/api/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json','Authorization': 'Bearer ' + authToken },
    body: JSON.stringify({ message: msg })
  });
  loadTickets();
});
async function loadTickets() {
  const res = await fetch(`${API_HOST}/api/support`, { headers: { 'Authorization': 'Bearer ' + authToken } });
  const tickets = await res.json();
  const ul = document.getElementById('ticketsList'); ul.innerHTML = '';
  tickets.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.id}: ${t.message} [${t.status}]`;
    ul.appendChild(li);
  });
}

// Profile
async function loadProfile() {
  const res = await fetch(`${API_HOST}/api/users/${currentUser.id}`, {
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  const u = await res.json();
  ['username','email','age','birthday','nationalId','passportNumber','passportExpiry'].forEach(field => {
    const el = document.getElementById('p_' + field);
    if (el) el.value = u[field] || '';
  });
}
document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username: document.getElementById('p_username').value,
    email: document.getElementById('p_email').value,
    age: document.getElementById('p_age').value,
    birthday: document.getElementById('p_birthday').value,
    nationalId: document.getElementById('p_nationalId').value,
    passportNumber: document.getElementById('p_passportNumber').value,
    passportExpiry: document.getElementById('p_passportExpiry').value
  };
  const res = await fetch(`${API_HOST}/api/users/${currentUser.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json','Authorization': 'Bearer ' + authToken },
    body: JSON.stringify(body)
  });
  document.getElementById('profileMessage').textContent = res.ok ? 'Profile updated' : 'Update failed';
});
