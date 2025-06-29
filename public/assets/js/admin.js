import { ensureAuth, getToken } from './auth.js';
const API = 'http://localhost:3000/api/users';

// Guard & token
ensureAuth();
const token = getToken();

// Elements
const roleFilter    = document.getElementById('roleFilter');
const searchInput   = document.getElementById('searchUser');
const tbody         = document.querySelector('#usersTable tbody');
const openCreateBtn = document.getElementById('openCreateBtn');
const userModal     = document.getElementById('userModal');
const closeModal    = document.getElementById('closeUserModal');
const modalTitle    = document.getElementById('modalTitle');
const userForm      = document.getElementById('userForm');
const deleteBtn     = document.getElementById('deleteUserBtn');

let allUsers = [];

// Fetch & render
async function loadUsers() {
  const res = await fetch(`${API}?role=${roleFilter.value}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  allUsers = await res.json();
  renderTable();
}

function renderTable() {
  const filter = searchInput.value.toLowerCase();
  tbody.innerHTML = '';
  allUsers
    .filter(u => u.username.toLowerCase().includes(filter))
    .forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td><button data-id="${u.id}">Edit</button></td>
      `;
      tr.querySelector('button').addEventListener('click', () => openModal(u));
      tbody.appendChild(tr);
    });
}

// Modal handlers
function openModal(user = {}) {
  modalTitle.textContent = user.id ? 'Edit User' : 'Create User';
  userForm.u_id.value       = user.id || '';
  userForm.u_username.value = user.username || '';
  userForm.u_email.value    = user.email    || '';
  userForm.u_role.value     = user.role     || 'visitorUser';
  userForm.u_password.value = '';
  deleteBtn.style.display   = user.id ? 'inline-block' : 'none';
  userModal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => userModal.classList.add('hidden'));

// Create or Update
userForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id       = userForm.u_id.value;
  const payload = {
    username: userForm.u_username.value,
    email:    userForm.u_email.value,
    password: userForm.u_password.value || undefined,
    role:     userForm.u_role.value,
    age:      parseInt(userForm.u_age.value, 10)
  };
 if (userForm.u_password.value) {
    payload.password = userForm.u_password.value;
  }
  const url    = id ? `${API}/${id}` : API;
  const method = id ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    userModal.classList.add('hidden');
    loadUsers();
  } else {
    alert('Error saving user');
  }
});

// Delete
deleteBtn.addEventListener('click', async () => {
  const id = userForm.u_id.value;
  if (!confirm('Delete this user?')) return;
  const res = await fetch(`${API}/${id}`, {
    method:'DELETE',
    headers:{ 'Authorization':'Bearer '+token }
  });
  if (res.ok) {
    userModal.classList.add('hidden');
    loadUsers();
  } else {
    alert('Error deleting');
  }
});

// Filters
roleFilter.addEventListener('change', loadUsers);
searchInput.addEventListener('input', renderTable);
openCreateBtn.addEventListener('click', () => openModal());

// Initial load
loadUsers();