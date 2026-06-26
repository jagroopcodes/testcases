/*
 * project.js
 * Handles all Project CRUD operations and rendering.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderProjects();
  setupProjectForm();
  setupProjectSearch();
});

// ===== Render Projects =====

function renderProjects() {
  const projects = Storage.getProjects();
  const tbody = document.getElementById('projectTableBody');
  const emptyState = document.getElementById('projectEmptyState');

  if (!tbody) return;

  // Clear the table body
  tbody.innerHTML = '';

  if (projects.length === 0) {
    // Show empty state, hide table
    if (emptyState) emptyState.style.display = 'block';
    tbody.closest('.table-container')?.classList.add('d-none');
    return;
  }

  // Hide empty state, show table
  if (emptyState) emptyState.style.display = 'none';
  tbody.closest('.table-container')?.classList.remove('d-none');

  // Build table rows
  projects.forEach(function (project) {
    const tr = document.createElement('tr');

    // Status badge color
    let statusClass = 'bg-secondary';
    if (project.status === 'Active') statusClass = 'bg-success';
    else if (project.status === 'Completed') statusClass = 'bg-primary';
    else if (project.status === 'On Hold') statusClass = 'bg-warning text-dark';
    else if (project.status === 'Cancelled') statusClass = 'bg-danger';

    tr.innerHTML = `
      <td>${escapeHtml(project.name)}</td>
      <td>${escapeHtml(project.client)}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(project.status)}</span></td>
      <td>${project.createdDate}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject('${project.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== Setup Form =====

function setupProjectForm() {
  const form = document.getElementById('projectForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('projectName').value.trim();
    const client = document.getElementById('projectClient').value.trim();
    const status = document.getElementById('projectStatus').value;
    const editId = document.getElementById('editProjectId').value;

    // Validate
    if (!name || !client) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    const projects = Storage.getProjects();

    if (editId) {
      // Edit existing project
      const index = projects.findIndex(function (p) { return p.id === editId; });
      if (index !== -1) {
        projects[index].name = name;
        projects[index].client = client;
        projects[index].status = status;
        showToast('Project updated successfully!', 'success');
      }
    } else {
      // Add new project
      const newProject = {
        id: generateId(),
        name: name,
        client: client,
        status: status,
        createdDate: getTodayDate()
      };
      projects.push(newProject);
      showToast('Project added successfully!', 'success');
    }

    // Save and refresh
    Storage.saveProjects(projects);
    renderProjects();

    // Reset form and close modal
    form.reset();
    document.getElementById('editProjectId').value = '';
    bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
  });
}

// ===== Edit Project =====

function editProject(id) {
  const projects = Storage.getProjects();
  const project = projects.find(function (p) { return p.id === id; });

  if (!project) {
    showToast('Project not found.', 'danger');
    return;
  }

  // Fill the form
  document.getElementById('projectName').value = project.name;
  document.getElementById('projectClient').value = project.client;
  document.getElementById('projectStatus').value = project.status;
  document.getElementById('editProjectId').value = project.id;

  // Update modal title
  document.getElementById('projectModalLabel').textContent = 'Edit Project';

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('projectModal'));
  modal.show();
}

// Reset modal when hidden
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', function () {
      document.getElementById('projectForm').reset();
      document.getElementById('editProjectId').value = '';
      document.getElementById('projectModalLabel').textContent = 'Add Project';
    });
  }
});

// ===== Delete Project =====

function deleteProject(id) {
  const projects = Storage.getProjects();
  const project = projects.find(function (p) { return p.id === id; });

  if (!project) return;

  confirmDelete(project.name, function () {
    const updated = projects.filter(function (p) { return p.id !== id; });
    Storage.saveProjects(updated);
    renderProjects();
    showToast('Project deleted successfully!', 'success');
  });
}

// ===== Search =====

function setupProjectSearch() {
  const searchInput = document.getElementById('projectSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const projects = Storage.getProjects();
    const tbody = document.getElementById('projectTableBody');
    const emptyState = document.getElementById('projectEmptyState');

    if (!tbody) return;

    const filtered = projects.filter(function (p) {
      return p.name.toLowerCase().includes(query) ||
             p.client.toLowerCase().includes(query) ||
             p.status.toLowerCase().includes(query);
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.querySelector('h6').textContent = query
          ? 'No projects match your search.'
          : 'No projects yet.';
      }
      tbody.closest('.table-container')?.classList.add('d-none');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tbody.closest('.table-container')?.classList.remove('d-none');

    filtered.forEach(function (project) {
      const tr = document.createElement('tr');

      let statusClass = 'bg-secondary';
      if (project.status === 'Active') statusClass = 'bg-success';
      else if (project.status === 'Completed') statusClass = 'bg-primary';
      else if (project.status === 'On Hold') statusClass = 'bg-warning text-dark';
      else if (project.status === 'Cancelled') statusClass = 'bg-danger';

      tr.innerHTML = `
        <td>${escapeHtml(project.name)}</td>
        <td>${escapeHtml(project.client)}</td>
        <td><span class="badge ${statusClass}">${escapeHtml(project.status)}</span></td>
        <td>${project.createdDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject('${project.id}')" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project.id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  });
}

// ===== Helper: Generate unique ID =====

function generateId() {
  return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ===== Helper: Get today's date as string =====

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// ===== Helper: Escape HTML to prevent XSS =====

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
