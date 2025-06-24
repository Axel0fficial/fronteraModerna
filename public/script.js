// script.js

const API_HOST = 'http://localhost:3000';
let authToken = null;
let userRole   = null;
let currentUser = { id: null, age: null };
let sortAsc    = true;

// Which sections each role may access
const ROLE_PERMISSIONS = {
  visitorUser: [
    'dashboardSection',
    'uploadSection',
    'case1Section','case2Section','case3Section',
    'case4Section','case5Section','case6Section',
    'supportSection',
    'profileSection'
  ],
  moderator: [
    'dashboardSection',
    'uploadSection',
    'case1Section','case2Section','case3Section',
    'case4Section','case5Section','case6Section',
    'reviewSection',
    'supportSection',
    'profileSection'
  ],
  supportUser: [
    'dashboardSection',
    'uploadSection',
    'case1Section','case2Section','case3Section',
    'case4Section','case5Section','case6Section',
    'supportSection',
    'profileSection'
  ],
  admin: [
    'dashboardSection',
    'uploadSection',
    'case1Section','case2Section','case3Section',
    'case4Section','case5Section','case6Section',
    'reviewSection',
    'supportSection',
    'profileSection',
    'adminSection'
  ]
};

// Show header, nav, footer after login
function initializeUI() {
  document.querySelector('header').style.display = 'block';
  document.querySelector('nav').style.display    = 'flex';
  document.querySelector('footer').style.display = 'block';
}

// Build nav based on ROLE_PERMISSIONS
function renderNav() {
  const navBar = document.getElementById('navBar');
  navBar.innerHTML = '';
  const labels = {
    dashboardSection: 'Dashboard',
    uploadSection:    'Submit Form',
    reviewSection:    'Review Forms',
    supportSection:   'Support',
    profileSection:   'Profile',
    adminSection:     'User Management'
  };
  ROLE_PERMISSIONS[userRole].forEach(sec => {
    const label = labels[sec];
    if (!label) return;
    const btn = document.createElement('button');
    btn.textContent    = label;
    btn.dataset.section= sec;
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

// Hide all sections, then show the requested one
function showSection(sectionId) {
  if (!ROLE_PERMISSIONS[userRole].includes(sectionId)) {
    return alert('🚫 You do not have access to that page.');
  }
  document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

// After initializeUI(), renderNav(), showSection('dashboardSection'):
if (currentUser.age < 18) {
  // Insert a warning at the top of the Submit Form section
  const uploadSection = document.getElementById('uploadSection');
  const warn = document.createElement('p');
  warn.className = 'warning';
  warn.textContent = '🚫 You must be 18 or older to submit any forms.';
  uploadSection.insertBefore(warn, uploadSection.firstElementChild.nextSibling);

  // Disable all case buttons
  document.querySelectorAll('#caseButtons button').forEach(btn => {
    btn.disabled = true;
    btn.title = 'You must be 18+ to access this';
  });
}


// Login flow
async function loginUser(username, password) {
  const res = await fetch(`${API_HOST}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    authToken = data.token;
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    userRole    = payload.role;
    currentUser.id  = payload.id;
    currentUser.age = payload.age; // ensure age is included in token if needed
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

// Sign-Up Modal
const signUpBtn    = document.getElementById('signUpBtn');
const signUpModal  = document.getElementById('signUpModal');
const signUpClose  = document.getElementById('signUpClose');
const signUpCancel = document.getElementById('signUpCancel');

signUpBtn.addEventListener('click', () => signUpModal.classList.remove('hidden'));
signUpClose.addEventListener('click', () => signUpModal.classList.add('hidden'));
signUpCancel.addEventListener('click', () => signUpModal.classList.add('hidden'));

document.getElementById('signUpForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username:       document.getElementById('s_username').value,
    email:          document.getElementById('s_email').value,
    password:       document.getElementById('s_password').value,
    age:            document.getElementById('s_age').value,
    birthday:       document.getElementById('s_birthday').value,
    nationalId:     document.getElementById('s_nationalId').value,
    passportNumber: document.getElementById('s_passportNumber').value,
    passportExpiry: document.getElementById('s_passportExpiry').value
  };
  const res = await fetch(`${API_HOST}/api/auth/register`, {
    method: 'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    alert('Account created! You can now log in.');
    signUpModal.classList.add('hidden');
  } else {
    const err = await res.json();
    alert('Sign-up failed: ' + err.error);
  }
});

// Case navigation buttons
document.querySelectorAll('#caseButtons button').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.case));
});
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showSection('uploadSection'));
});

// Placeholder handlers for all cases
['case1','case2','case3','case4','case5','case6'].forEach(key => {
  const form      = document.getElementById(`${key}Form`);
  const fileInput = document.getElementById(`${key}Files`);
  if (!form || !fileInput) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
     if (currentUser.age < 18) {
      return alert('🚫 You must be at least 18 years old to submit forms.');
    }

    // File count (if you still want it)
    const count = fileInput.files.length;
    if (count === 0) {
      return alert('Please select at least one file.');
    }
    alert(`Submitting ${fileInput.files.length} file(s) for ${key.replace('case','Case ')}`);
    showSection('uploadSection');
  });
});

// Case 1 upload handler
document.getElementById('case1UploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const file = document.getElementById('case1FilledPdf').files[0];
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch(`${API_HOST}/api/forms/upload`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + authToken },
    body: formData
  });
  if (res.ok) {
    alert('Case 1 form submitted!');
    showSection('uploadSection');
  } else {
    alert('Upload failed.');
  }
});

// Case 2 upload handler
document.getElementById('case2UploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const file = document.getElementById('case2FilledPdf').files[0];
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch(`${API_HOST}/api/forms/upload`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + authToken },
    body: formData
  });
  if (res.ok) {
    alert('Case 2 form submitted!');
    showSection('uploadSection');
  } else {
    alert('Upload failed.');
  }
});


// Custom Case 5 logic
const case5Form  = document.getElementById('case5Form');
const case5Files = document.getElementById('case5Files');

case5Form.addEventListener('submit', e => {
  e.preventDefault();
  if (currentUser.age < 18) {
    return alert('🚫 You must be at least 18 years old to submit Case 5.');
  }
  const files = case5Files.files;
  if (files.length < 1 || files.length > 7) {
    return alert('🚫 Please select between 1 and 7 PDF files.');
  }
  alert(`✅ Submitting ${files.length} file(s) for Case 5`);
  showSection('uploadSection');
});

// Review Forms (moderator/admin)
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
      <td><a href="${API_HOST}/${f.pdfUrl}" target="_blank" rel="noopener">View</a></td>
      <td>\${f.status==='pending'
        ? \`<button onclick="updateStatus(\${f.id},'approved')">✅</button>
           <button onclick="updateStatus(\${f.id},'rejected')">✖️</button>\`
        : ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateStatus = async function(id, status) {
  await fetch(`${API_HOST}/api/forms/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+authToken
    },
    body: JSON.stringify({ status })
  });
  loadForms();
};

// Support Tickets
async function loadTickets() {
  const res = await fetch(`${API_HOST}/api/support`, {
    headers: { 'Authorization':'Bearer '+authToken }
  });
  const tickets = await res.json();
  const ul = document.getElementById('ticketsList');
  ul.innerHTML = '';
  tickets.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.id}: ${t.message} [${t.status}]`;
    ul.appendChild(li);
  });
}

document.getElementById('supportForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = document.getElementById('supportMessage').value;
  await fetch(`${API_HOST}/api/support`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+authToken
    },
    body: JSON.stringify({ message: msg })
  });
  loadTickets();
});

// Profile
async function loadProfile() {
  const res = await fetch(`${API_HOST}/api/users/${currentUser.id}`, {
    headers: { 'Authorization':'Bearer '+authToken }
  });
  const u = await res.json();
  ['username','email','age','birthday','nationalId','passportNumber','passportExpiry']
    .forEach(field => {
      const el = document.getElementById('p_' + field);
      if (el) el.value = u[field] || '';
    });
}

document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username:       document.getElementById('p_username').value,
    email:          document.getElementById('p_email').value,
    age:            document.getElementById('p_age').value,
    birthday:       document.getElementById('p_birthday').value,
    nationalId:     document.getElementById('p_nationalId').value,
    passportNumber: document.getElementById('p_passportNumber').value,
    passportExpiry: document.getElementById('p_passportExpiry').value
  };
  await fetch(`${API_HOST}/api/users/${currentUser.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+authToken
    },
    body: JSON.stringify(body)
  });
  alert('Profile updated');
});

// Admin: User Management
async function loadUsers() {
  const role = document.getElementById('roleFilter').value;
  let url = `${API_HOST}/api/users`;
  if (role) url += `?role=${role}`;

  const res = await fetch(url, {
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  const users = await res.json();

  // sort alphabetically
  users.sort((a, b) => a.username.localeCompare(b.username) * (sortAsc ? 1 : -1));

  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
    `;
    tr.addEventListener('click', () => openModal(u));
    tbody.appendChild(tr);
  });
}

document.getElementById('roleFilter').addEventListener('change', loadUsers);
document.getElementById('sortAlpha').addEventListener('click', () => {
  sortAsc = !sortAsc;
  loadUsers();
});

// Edit User Modal
function openModal(u) {
  const modal = document.getElementById('userModal');
  modal.classList.remove('hidden');
  const form = document.getElementById('modalForm');
  form.dataset.userId = u.id;
  ['username','email','role','age','birthday','nationalId','passportNumber','passportExpiry']
    .forEach(field => {
      const el = document.getElementById('m_' + field);
      if (el) el.value = u[field] || '';
    });
  document.getElementById('m_password').value = '';
}
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
    nationalId:     document.getElementById('m_nationalId').value,
    passportNumber: document.getElementById('m_passportNumber').value,
    passportExpiry: document.getElementById('m_passportExpiry').value
  };
  const pwd = document.getElementById('m_password').value;
  if (pwd) body.password = pwd;
  await fetch(`${API_HOST}/api/users/${id}`, {
    method: 'PATCH',
    headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+authToken },
    body: JSON.stringify(body)
  });
  loadUsers();
  document.getElementById('userModal').classList.add('hidden');
});
document.getElementById('deleteUserBtn').addEventListener('click', async () => {
  if (!confirm('Delete this user?')) return;
  const id = document.getElementById('modalForm').dataset.userId;
  await fetch(`${API_HOST}/api/users/${id}`, {
    method: 'DELETE',
    headers:{ 'Authorization':'Bearer '+authToken }
  });
  loadUsers();
  document.getElementById('userModal').classList.add('hidden');
});

// Create-User Modal Handlers
const createBtn     = document.getElementById('createUserBtn');
const createModal   = document.getElementById('createUserModal');
const createClose   = document.getElementById('createModalClose');
const createCancel  = document.getElementById('createCancelBtn');

createBtn.addEventListener('click', () => createModal.classList.remove('hidden'));
createClose.addEventListener('click', () => createModal.classList.add('hidden'));
createCancel.addEventListener('click', () => createModal.classList.add('hidden'));

document.getElementById('createUserForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username:       document.getElementById('c_username').value,
    email:          document.getElementById('c_email').value,
    role:           document.getElementById('c_role').value,
    age:            document.getElementById('c_age').value,
    birthday:       document.getElementById('c_birthday').value,
    nationalId:     document.getElementById('c_nationalId').value,
    passportNumber: document.getElementById('c_passportNumber').value,
    passportExpiry: document.getElementById('c_passportExpiry').value,
    password:       document.getElementById('c_password').value
  };
  const res = await fetch(`${API_HOST}/api/auth/register`, {
    method: 'POST',
    headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+authToken },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    loadUsers();
    createModal.classList.add('hidden');
  } else {
    const err = await res.json();
    alert('Create failed: ' + err.error);
  }
});
