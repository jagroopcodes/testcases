/*
 * report.js
 * Renders the Reports page with summary counts and progress bars.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderReports();
});

function renderReports() {
  const testCases = Storage.getTestCases();

  // Count by status
  const total = testCases.length;
  let passed = 0, failed = 0, pending = 0, blocked = 0, inProgress = 0;

  testCases.forEach(function (tc) {
    switch (tc.status) {
      case 'Passed':
        passed++;
        break;
      case 'Failed':
        failed++;
        break;
      case 'Pending':
        pending++;
        break;
      case 'Blocked':
        blocked++;
        break;
      case 'In Progress':
        inProgress++;
        break;
    }
  });

  // Update stat cards
  setTextContent('reportTotalTests', total);
  setTextContent('reportPassed', passed);
  setTextContent('reportFailed', failed);
  setTextContent('reportPending', pending + blocked + inProgress);

  // Calculate percentages for progress bar
  const passedPercent = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.round((failed / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round(((pending + blocked + inProgress) / total) * 100) : 0;

  // Render progress bars
  const progressContainer = document.getElementById('reportProgress');
  if (!progressContainer) return;

  if (total === 0) {
    progressContainer.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-bar-chart"></i>
        <h6>No data to display</h6>
        <p>Add test cases to see the report.</p>
      </div>
    `;
    return;
  }

  progressContainer.innerHTML = `
    <h6 class="mb-3">Overall Progress</h6>

    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="small">Passed</span>
        <span class="small fw-bold text-success">${passed} (${passedPercent}%)</span>
      </div>
      <div class="progress" style="height: 10px;">
        <div class="progress-bar bg-success" role="progressbar"
             style="width: ${passedPercent}%"
             aria-valuenow="${passedPercent}" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="small">Failed</span>
        <span class="small fw-bold text-danger">${failed} (${failedPercent}%)</span>
      </div>
      <div class="progress" style="height: 10px;">
        <div class="progress-bar bg-danger" role="progressbar"
             style="width: ${failedPercent}%"
             aria-valuenow="${failedPercent}" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="small">Pending / In Progress / Blocked</span>
        <span class="small fw-bold text-warning">${pending + blocked + inProgress} (${pendingPercent}%)</span>
      </div>
      <div class="progress" style="height: 10px;">
        <div class="progress-bar bg-warning" role="progressbar"
             style="width: ${pendingPercent}%"
             aria-valuenow="${pendingPercent}" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
    </div>

    <hr>

    <div class="d-flex justify-content-between mb-1">
      <span class="small fw-bold">Total Test Cases</span>
      <span class="small fw-bold">${total}</span>
    </div>
  `;
}

// Helper to safely set text content
function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}
