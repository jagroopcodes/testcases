/*
 * testcase.js
 * Handles all Test Case CRUD operations and rendering.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderTestCases();
  setupTestCaseForm();
  setupTestCaseSearch();
  setupTestCaseFilter();
});

// ===== Render Test Cases =====

function renderTestCases() {
  const testCases = Storage.getTestCases();
  const tbody = document.getElementById('testCaseTableBody');
  const emptyState = document.getElementById('testCaseEmptyState');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (testCases.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    tbody.closest('.table-container')?.classList.add('d-none');
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  tbody.closest('.table-container')?.classList.remove('d-none');

  testCases.forEach(function (tc) {
    const tr = document.createElement('tr');

    // Status badge
    let statusClass = 'bg-secondary';
    if (tc.status === 'Passed') statusClass = 'bg-success';
    else if (tc.status === 'Failed') statusClass = 'bg-danger';
    else if (tc.status === 'In Progress') statusClass = 'bg-info text-dark';
    else if (tc.status === 'Blocked') statusClass = 'bg-dark';

    // Priority badge
    let priorityClass = 'bg-secondary';
    if (tc.priority === 'High') priorityClass = 'bg-danger';
    else if (tc.priority === 'Medium') priorityClass = 'bg-warning text-dark';
    else if (tc.priority === 'Low') priorityClass = 'bg-success';

    tr.innerHTML = `
      <td><code>${escapeHtml(tc.testCaseId)}</code></td>
      <td>${escapeHtml(tc.title)}</td>
      <td>${escapeHtml(tc.module)}</td>
      <td><span class="badge ${priorityClass}">${escapeHtml(tc.priority)}</span></td>
      <td><span class="badge ${statusClass}">${escapeHtml(tc.status)}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editTestCase('${tc.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTestCase('${tc.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== Generate Next Test Case ID =====

function getNextTestCaseId() {
  const testCases = Storage.getTestCases();
  if (testCases.length === 0) return 'TC-001';

  // Extract numbers from existing IDs and find max
  let maxNum = 0;
  testCases.forEach(function (tc) {
    const match = tc.testCaseId.match(/TC-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  const next = maxNum + 1;
  return 'TC-' + String(next).padStart(3, '0');
}

// ===== Setup Form =====

function setupTestCaseForm() {
  const form = document.getElementById('testCaseForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('tcTitle').value.trim();
    const module = document.getElementById('tcModule').value.trim();
    const priority = document.getElementById('tcPriority').value;
    const status = document.getElementById('tcStatus').value;
    const steps = document.getElementById('tcSteps').value.trim();
    const expectedResult = document.getElementById('tcExpected').value.trim();
    const editId = document.getElementById('editTestCaseId').value;

    // Validate
    if (!title || !module || !steps || !expectedResult) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const testCases = Storage.getTestCases();

    if (editId) {
      // Edit existing
      const index = testCases.findIndex(function (t) { return t.id === editId; });
      if (index !== -1) {
        testCases[index].title = title;
        testCases[index].module = module;
        testCases[index].priority = priority;
        testCases[index].status = status;
        testCases[index].steps = steps;
        testCases[index].expectedResult = expectedResult;
        showToast('Test case updated successfully!', 'success');
      }
    } else {
      // Add new
      const newTC = {
        id: generateTCId(),
        testCaseId: getNextTestCaseId(),
        title: title,
        module: module,
        priority: priority,
        status: status,
        steps: steps,
        expectedResult: expectedResult,
        createdDate: getTodayDate()
      };
      testCases.push(newTC);
      showToast('Test case added successfully!', 'success');
    }

    Storage.saveTestCases(testCases);
    renderTestCases();

    form.reset();
    document.getElementById('editTestCaseId').value = '';
    bootstrap.Modal.getInstance(document.getElementById('testCaseModal')).hide();
  });
}

// ===== Edit Test Case =====

function editTestCase(id) {
  const testCases = Storage.getTestCases();
  const tc = testCases.find(function (t) { return t.id === id; });

  if (!tc) {
    showToast('Test case not found.', 'danger');
    return;
  }

  document.getElementById('tcTitle').value = tc.title;
  document.getElementById('tcModule').value = tc.module;
  document.getElementById('tcPriority').value = tc.priority;
  document.getElementById('tcStatus').value = tc.status;
  document.getElementById('tcSteps').value = tc.steps;
  document.getElementById('tcExpected').value = tc.expectedResult;
  document.getElementById('editTestCaseId').value = tc.id;

  document.getElementById('testCaseModalLabel').textContent = 'Edit Test Case';

  const modal = new bootstrap.Modal(document.getElementById('testCaseModal'));
  modal.show();
}

// Reset modal
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('testCaseModal');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', function () {
      document.getElementById('testCaseForm').reset();
      document.getElementById('editTestCaseId').value = '';
      document.getElementById('testCaseModalLabel').textContent = 'Add Test Case';
    });
  }
});

// ===== Delete Test Case =====

function deleteTestCase(id) {
  const testCases = Storage.getTestCases();
  const tc = testCases.find(function (t) { return t.id === id; });

  if (!tc) return;

  confirmDelete(tc.testCaseId + ' - ' + tc.title, function () {
    const updated = testCases.filter(function (t) { return t.id !== id; });
    Storage.saveTestCases(updated);
    renderTestCases();
    showToast('Test case deleted successfully!', 'success');
  });
}

// ===== Search =====

function setupTestCaseSearch() {
  const searchInput = document.getElementById('testCaseSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    applyFilters();
  });
}

// ===== Filter by Status =====

function setupTestCaseFilter() {
  const filterSelect = document.getElementById('testCaseFilter');
  if (!filterSelect) return;

  filterSelect.addEventListener('change', function () {
    applyFilters();
  });
}

function applyFilters() {
  const query = (document.getElementById('testCaseSearch')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('testCaseFilter')?.value || '';
  const testCases = Storage.getTestCases();
  const tbody = document.getElementById('testCaseTableBody');
  const emptyState = document.getElementById('testCaseEmptyState');

  if (!tbody) return;

  const filtered = testCases.filter(function (tc) {
    const matchesSearch = tc.title.toLowerCase().includes(query) ||
                          tc.module.toLowerCase().includes(query) ||
                          tc.testCaseId.toLowerCase().includes(query) ||
                          tc.priority.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || tc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.querySelector('h6').textContent = (query || statusFilter)
        ? 'No test cases match your filters.'
        : 'No test cases yet.';
    }
    tbody.closest('.table-container')?.classList.add('d-none');
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  tbody.closest('.table-container')?.classList.remove('d-none');

  filtered.forEach(function (tc) {
    const tr = document.createElement('tr');

    let statusClass = 'bg-secondary';
    if (tc.status === 'Passed') statusClass = 'bg-success';
    else if (tc.status === 'Failed') statusClass = 'bg-danger';
    else if (tc.status === 'In Progress') statusClass = 'bg-info text-dark';
    else if (tc.status === 'Blocked') statusClass = 'bg-dark';

    let priorityClass = 'bg-secondary';
    if (tc.priority === 'High') priorityClass = 'bg-danger';
    else if (tc.priority === 'Medium') priorityClass = 'bg-warning text-dark';
    else if (tc.priority === 'Low') priorityClass = 'bg-success';

    tr.innerHTML = `
      <td><code>${escapeHtml(tc.testCaseId)}</code></td>
      <td>${escapeHtml(tc.title)}</td>
      <td>${escapeHtml(tc.module)}</td>
      <td><span class="badge ${priorityClass}">${escapeHtml(tc.priority)}</span></td>
      <td><span class="badge ${statusClass}">${escapeHtml(tc.status)}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editTestCase('${tc.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTestCase('${tc.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== Helpers =====

function generateTCId() {
  return 'tc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}
