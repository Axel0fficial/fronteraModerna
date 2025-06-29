// public/assets/js/common.js
import { ensureAuth, getUserFromToken, clearToken } from './auth.js';

// Define nav items with labels, target href, and allowed roles
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio', href: 'dashboard.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'submit',    label: 'Formularios', href: 'submit.html',        roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'review',    label: 'Revisar Formularios',href:'review.html',         roles: ['moderator','admin'] },
  //{ id: 'support',   label: 'Soporte',     href: 'support.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'profile',   label: 'Perfil',     href: 'profile.html',       roles: ['visitorUser','moderator','supportUser','admin'] },
  { id: 'admin',     label: 'Administracion de Usuarios', href: 'admin.html',    roles: ['admin'] }
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
    header.innerHTML = `<img id="headerLogo" src="/images/header.png" alt="Company Logo" />`;
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
    footer.innerHTML = `<p>Fono Contact Center: 600 570 70 40  | Plaza Sotomayor 60, Valparaíso, Chile.</p>`;
    footer.classList.remove('hidden'); // show footer
  }
}

// On DOM load, render the shared layout
window.addEventListener('DOMContentLoaded', () => {
  renderLayout();
});
