const API_HOST = 'http://localhost:3000';
let authToken = null;
let userRole = null;
let sortAsc = true;
let currentUser = { id: null };

const ROLE_PERMISSIONS = {
  visitorUser: ['dashboardSection','uploadSection','supportSection','profileSection'],
  moderator:   ['dashboardSection','uploadSection','reviewSection','supportSection','profileSection'],
  supportUser: ['dashboardSection','uploadSection','supportSection','profileSection'],
  admin:       ['dashboardSection','uploadSection','reviewSection','supportSection','profileSection','adminSection'],
};

function initializeUI() {
  // Show header, nav, footer after login
  document.querySelector('header').style.display = 'block';
  document.querySelector('nav').style.display = 'flex';
  document.querySelector('footer').style.display = 'block';
}

function renderNav() {
  const navBar = document.getElementById('navBar');
  navBar.innerHTML = '';
  const labels = {
    dashboardSection: 'Dashboard',
    uploadSection:    'Submit Form',
    reviewSection:    'Review Forms',
    supportSection:   'Support',
    profileSection:   'Profile',
    adminSection:     'User Management',
  };
  ROLE_PERMISSIONS[userRole].forEach(sec => {
    const btn = document.createElement('button');
    btn.textContent = labels[sec];
    btn.dataset.section = sec;
    btn.addEventListener('click', () => {
      if (sec === 'reviewSection') loadForms();
      if (sec === 'supportSection') loadTickets();
      if (sec === 'profileSection') loadProfile();
      if (sec === 'adminSection') loadUsers();
      showSection(sec);
    });
    navBar.appendChild(btn);
  });
  const logout = document.createElement('button');
  logout.textContent = 'Logout';
  logout.addEventListener('click', () => location.reload());
  navBar.appendChild(logout);
}

function showSection(sectionId) {
  if (!ROLE_PERMISSIONS[userRole].includes(sectionId)) {
    return alert('🚫 You do not have access to that page.');
  }
  document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

async function loginUser(username, password) {
  const res = await fetch(`${API_HOST}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    authToken = data.token;
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    userRole = payload.role;
    currentUser.id = payload.id;
    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayRole').textContent     = userRole;
    initializeUI();
    renderNav();
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

async function loadUsers() {
  const role = document.getElementById('roleFilter').value;
  let url = `${API_HOST}/api/users`;
  if (role) url += `?role=${role}`;
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + authToken } });
  let users = await res.json();
  users.sort((a,b) => a.username.localeCompare(b.username) * (sortAsc ? 1 : -1));
  const tbody = document.querySelector('#usersTable tbody'); tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.email}</td><td>${u.role}`;
    tr.addEventListener('click', () => openModal(u));
    tbody.appendChild(tr);
  });
}

// Filters
document.getElementById('roleFilter').addEventListener('change', loadUsers);
document.getElementById('sortAlpha').addEventListener('click', () => { sortAsc = !sortAsc; loadUsers(); });

function openModal(u) {
  const modal = document.getElementById('userModal');
  modal.classList.remove('hidden');

  const form = document.getElementById('modalForm');
  form.dataset.userId = u.id;

  document.getElementById('m_username').value      = u.username;
  document.getElementById('m_email').value         = u.email;
  document.getElementById('m_role').value          = u.role;
  document.getElementById('m_age').value           = u.age || '';
  document.getElementById('m_birthday').value      = u.birthday || '';
  document.getElementById('m_nationalId').value    = u.nationalId || '';
  document.getElementById('m_passportNumber').value= u.passportNumber || '';
  document.getElementById('m_passportExpiry').value= u.passportExpiry || '';
  document.getElementById('m_password').value      = '';
}

// 4) Close modal
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('userModal').classList.add('hidden');
});

document.getElementById('modalForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = e.target.dataset.userId;
  const body = {
    username: document.getElementById('m_username').value,
    email:    document.getElementById('m_email').value,
    role:     document.getElementById('m_role').value,
    age:      document.getElementById('m_age').value,
    birthday: document.getElementById('m_birthday').value,
    nationalId:    document.getElementById('m_nationalId').value,
    passportNumber: document.getElementById('m_passportNumber').value,
    passportExpiry: document.getElementById('m_passportExpiry').value
  };
  const pwd = document.getElementById('m_password').value;
  if (pwd) body.password = pwd;

  const res = await fetch(`${API_HOST}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    loadUsers();
    document.getElementById('userModal').classList.add('hidden');
  } else {
    alert('Update failed');
  }
});

// 6) Delete user
document.getElementById('deleteUserBtn').addEventListener('click', async () => {
  if (!confirm('Delete this user?')) return;
  const id = document.getElementById('modalForm').dataset.userId;
  const res = await fetch(`${API_HOST}/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  if (res.ok) {
    loadUsers();
    document.getElementById('userModal').classList.add('hidden');
  } else {
    alert('Delete failed');
  }
});

document.getElementById('createUserBtn').addEventListener('click', () => {
  document.getElementById('createUserModal').classList.remove('hidden');
});
document.getElementById('createModalClose').addEventListener('click', () => {
  document.getElementById('createUserModal').classList.add('hidden');
});
document.getElementById('createCancelBtn').addEventListener('click', () => {
  document.getElementById('createUserModal').classList.add('hidden');
});
document.getElementById('createUserForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username: document.getElementById('c_username').value,
    email:    document.getElementById('c_email').value,
    role:     document.getElementById('c_role').value,
    age:      document.getElementById('c_age').value,
    birthday: document.getElementById('c_birthday').value,
    nationalId: document.getElementById('c_nationalId').value,
    passportNumber: document.getElementById('c_passportNumber').value,
    passportExpiry: document.getElementById('c_passportExpiry').value,
    password: document.getElementById('c_password').value
  };
  const res = await fetch(`${API_HOST}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    loadUsers();
    document.getElementById('createUserModal').classList.add('hidden');
  } else {
    alert('Create failed');
  }
});