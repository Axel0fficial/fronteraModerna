const API_HOST = 'http://localhost:3000';  // or import from a shared config
import { saveToken } from './auth.js';

const openSignUpBtn = document.getElementById('openSignUp');
const signUpModal   = document.getElementById('signUpModal');
const signUpClose   = document.getElementById('signUpClose');
const signUpCancel  = document.getElementById('signUpCancel');
const ageInput = document.getElementById('s_age');
const guardianDiv = document.getElementById('guardianFields');

ageInput.addEventListener('input', () => {
  const age = parseInt(ageInput.value, 10);
  if (!isNaN(age) && age < 18) {
    guardianDiv.classList.remove('hidden');
  } else {
    guardianDiv.classList.add('hidden');
  }
});

openSignUpBtn.addEventListener('click', () => {
  signUpModal.classList.remove('hidden');
});
signUpClose.addEventListener('click', () => {
  signUpModal.classList.add('hidden');
});
signUpCancel.addEventListener('click', () => {
  signUpModal.classList.add('hidden');
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    return alert('Login failed');
  }
  const { token } = await res.json();
  saveToken(token);
  window.location.href = 'dashboard.html';
});

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert('🎉 Account created! Please log in.');
    signUpModal.classList.add('hidden');
  } else {
    const err = await res.json();
    alert('Sign-up failed: ' + err.error);
  }
});