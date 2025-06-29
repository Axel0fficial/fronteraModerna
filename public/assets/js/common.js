// public/assets/js/common.js
import { ensureAuth, getUserFromToken, clearToken } from './auth.js';

// Define nav items with labels, target href, and allowed roles
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'submit',    label: 'Submit Form', href: 'submit.html',        roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'review',    label: 'Review Forms',href:'review.html',         roles: ['moderator','admin'] },
  { id: 'support',   label: 'Support',     href: 'support.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'profile',   label: 'Profile',     href: 'profile.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'admin',     label: 'User Management', href: 'admin.html',    roles: ['admin'] }
];

// Insert header, nav, and footer into each page
export function renderLayout() {
  // 1. Ensure user is authenticated
  const token = ensureAuth();
  if (!token) return;

  const user = getUserFromToken();

  // 2. Header
  const header = document.getElementById('header');
  if (header) {
    header.innerHTML = `<img id="headerLogo" src="header.jpg" alt="Company Logo"/>`;
    header.classList.remove('hidden'); // show header
  }

  // 3. Nav
  const navBar = document.getElementById('navBar');
  if (navBar) {
    navBar.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      if (item.roles.includes(user.role)) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        a.className = 'nav-link';
        navBar.appendChild(a);
      }
    });
    // Logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => {
      clearToken();
      window.location.href = 'login.html';
    });
    navBar.appendChild(logoutBtn);
    navBar.classList.remove('hidden'); // show nav
  }

  // 4. Footer
  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML = `<p>Contact us at: datalake@example.com | Address: 1234 Data St, Analytics City</p>`;
    footer.classList.remove('hidden'); // show footer
  }
}

// On DOM load, render the shared layout
window.addEventListener('DOMContentLoaded', () => {
  renderLayout();
});
