/*
 * storage.js
 * Handles all LocalStorage operations for the Test Case Management System.
 * Uses a simple prefix 'tcm_' to avoid key conflicts.
 */

const Storage = {
  prefix: 'tcm_',

  // ===== Generic helpers =====

  // Get an item from localStorage and parse it as JSON
  get(key) {
    const data = localStorage.getItem(this.prefix + key);
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Save an item to localStorage as JSON
  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },

  // Remove an item from localStorage
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  // ===== Projects =====

  getProjects() {
    return this.get('projects') || [];
  },

  saveProjects(projects) {
    this.set('projects', projects);
  },

  // ===== Test Cases =====

  getTestCases() {
    return this.get('testcases') || [];
  },

  saveTestCases(testCases) {
    this.set('testcases', testCases);
  },

  // ===== Theme =====

  getTheme() {
    return this.get('theme') || 'light';
  },

  saveTheme(theme) {
    this.set('theme', theme);
  },

  // ===== Utility =====

  // Clear all application data (used in Settings)
  clearAll() {
    this.remove('projects');
    this.remove('testcases');
    this.remove('theme');
  }
};
