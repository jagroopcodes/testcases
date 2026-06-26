/*
 * settings.js
 * Handles Settings page: theme toggle, clear all data.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Set current theme on the toggle
  const currentTheme = Storage.getTheme();
  const toggle = document.getElementById('settingsThemeToggle');
  if (toggle) {
    toggle.checked = (currentTheme === 'dark');
    toggle.addEventListener('change', function () {
      const theme = this.checked ? 'dark' : 'light';
      Storage.saveTheme(theme);
      applyTheme(theme);
      showToast('Theme changed to ' + theme + ' mode.', 'info');
    });
  }

  // Clear all data button
  const clearBtn = document.getElementById('clearAllData');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      confirmDelete('ALL data (projects, test cases, and settings)', function () {
        Storage.clearAll();
        // Reset theme to light
        applyTheme('light');
        if (toggle) toggle.checked = false;
        showToast('All data has been cleared.', 'success');
      });
    });
  }

  // Update toggle visual to match current state
  updateToggleLabel(currentTheme);
  if (toggle) {
    toggle.addEventListener('change', function () {
      updateToggleLabel(this.checked ? 'dark' : 'light');
    });
  }
});

function updateToggleLabel(theme) {
  const label = document.getElementById('themeLabel');
  if (label) {
    label.textContent = theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)';
  }
}
