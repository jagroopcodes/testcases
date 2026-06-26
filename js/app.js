/*
 * app.js
 * Shared utilities: navigation, theme toggle, toast notifications, modals.
 */

// ===== Wait for DOM to be ready =====
document.addEventListener('DOMContentLoaded', function () {

  // Apply saved theme on page load
  applyTheme(Storage.getTheme());

  // Set active nav link based on current page
  setActiveNavLink();

  // Set up sidebar toggle for mobile
  setupSidebarToggle();

  // Set up theme toggle button if it exists
  setupThemeToggle();
});

// ===== Theme =====

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  // Update toggle icon if it exists
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.innerHTML = theme === 'dark'
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-fill"></i>';
  }
}

function toggleTheme() {
  const current = Storage.getTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  Storage.saveTheme(newTheme);
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme} mode`, 'info');
}

function setupThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }
}

// ===== Navigation =====

function setActiveNavLink() {
  // Get the current page filename from the URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  // Find all nav links and mark the matching one as active
  document.querySelectorAll('.sidebar .nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ===== Sidebar Toggle (Mobile) =====

function setupSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

// ===== Toast Notifications =====

function showToast(message, type) {
  // type can be: 'success', 'danger', 'warning', 'info'
  type = type || 'info';

  // Get or create the toast container
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Map type to Bootstrap bg classes
  const bgMap = {
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-primary text-white'
  };

  const iconMap = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };

  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center border-0';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body ${bgMap[type] || bgMap.info} rounded-start d-flex align-items-center gap-2">
        <i class="bi ${iconMap[type] || iconMap.info}"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  // Initialize Bootstrap toast and show it
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();

  // Remove from DOM after it's hidden
  toastEl.addEventListener('hidden.bs.toast', function () {
    toastEl.remove();
  });
}

// ===== Delete Confirmation Modal =====

// A shared function to show a delete confirmation dialog
// Calls the onConfirm callback if the user clicks "Delete"
function confirmDelete(itemName, onConfirm) {
  // Get the modal element
  const modalEl = document.getElementById('confirmDeleteModal');
  if (!modalEl) return;

  // Set the item name in the modal body
  const bodyEl = modalEl.querySelector('.modal-body');
  if (bodyEl) {
    bodyEl.innerHTML = `Are you sure you want to delete <strong>${itemName}</strong>? This action cannot be undone.`;
  }

  // Create the modal instance and show it
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Set up the confirm button
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    // Remove any previous event listeners by cloning
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', function () {
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
      modal.hide();
    });
  }
}
