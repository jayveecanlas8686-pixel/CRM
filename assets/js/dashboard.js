/* ============================================================
   NEXUS CRM — DASHBOARD
   ============================================================ */

function initDashboard() {
  initApp('Dashboard');
  loadStats();
  loadRecentActivities();
  loadUpcomingTasks();
  loadPipelineSummary();
  renderSalesChart();
  renderConversionChart();
}

function loadStats() {
  const customers = DB.getAll('customers');
  const leads = DB.getAll('leads');
  const deals = DB.getAll('deals');
  const tasks = DB.getAll('tasks');

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const newLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted').length;
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const forecast = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const wonDeals = deals.filter(d => d.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  // Conversion rate
  const totalLeads = leads.length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const convRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;

  setVal('statCustomers', activeCustomers);
  setVal('statLeads', newLeads);
  setVal('statForecast', formatCurrency(forecast));
  setVal('statTasks', pendingTasks);
  setVal('statRevenue', formatCurrency(totalRevenue));
  setVal('statConversion', convRate + '%');
  setVal('statDeals', activeDeals.length);
  setVal('statWon', wonDeals.length);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function loadRecentActivities() {
  const container = document.getElementById('recentActivities');
  if (!container) return;
  const activities = DB.getAll('activities').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  if (!activities.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-stream"></i><p>No activities yet</p></div>'; return; }

  const typeColors = { call: 'primary', meeting: 'success', email: 'info', note: 'warning', status_update: 'secondary', task_completed: 'success', customer_created: 'accent', lead_created: 'info', deal_created: 'primary' };

  container.innerHTML = `<div class="timeline">` + activities.map(a => `
    <div class="timeline-item fade-in">
      <div class="timeline-icon-wrap">
        <div class="timeline-icon" style="background:var(--${typeColors[a.type] || 'info'}-bg);color:var(--${typeColors[a.type] || 'info'})">
          <i class="fas ${a.icon || 'fa-circle'}"></i>
        </div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-title">${escapeHtml(a.createdByName)}</span>
          <span class="timeline-time">${formatDateRelative(a.createdAt)}</span>
        </div>
        <div class="timeline-desc">${escapeHtml(a.description)}</div>
      </div>
    </div>`).join('') + `</div>`;
}

function loadUpcomingTasks() {
  const container = document.getElementById('upcomingTasks');
  if (!container) return;
  const today = new Date().toISOString().split('T')[0];
  const tasks = DB.getAll('tasks')
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  if (!tasks.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>All tasks completed!</p></div>'; return; }

  container.innerHTML = tasks.map(t => {
    const overdue = t.dueDate < today;
    return `
    <div class="flex items-center gap-3 mb-3" style="padding:12px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
      <div style="width:34px;height:34px;border-radius:8px;background:var(--${overdue ? 'danger' : 'primary'}-bg);color:var(--${overdue ? 'danger' : 'primary'});display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="fas fa-${overdue ? 'exclamation-circle' : 'clock'}"></i>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.title)}</div>
        <div style="font-size:0.75rem;color:var(--${overdue ? 'danger' : 'text-muted'})">${overdue ? '⚠ Overdue · ' : ''}Due ${formatDate(t.dueDate)}</div>
      </div>
      ${priorityBadge(t.priority)}
    </div>`;
  }).join('');
}

function loadPipelineSummary() {
  const container = document.getElementById('pipelineSummary');
  if (!container) return;
  const deals = DB.getAll('deals').filter(d => d.stage !== 'lost');
  const stages = DB.getAll('pipelineStages');

  const stageData = stages.map(s => {
    const stageDeals = deals.filter(d => d.stage === s.id);
    const total = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return { ...s, count: stageDeals.length, total };
  });

  const maxTotal = Math.max(...stageData.map(s => s.total), 1);

  container.innerHTML = stageData.map(s => `
    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <span style="font-size:0.82rem;font-weight:600">${s.name}</span>
        <span style="font-size:0.78rem;color:var(--text-muted)">${s.count} deals · ${formatCurrency(s.total)}</span>
      </div>
      <div class="progress">
        <div class="progress-bar" style="width:${Math.round((s.total/maxTotal)*100)}%;background:${s.color}"></div>
      </div>
    </div>`).join('');
}

function renderSalesChart() {
  const container = document.getElementById('salesChart');
  if (!container) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const values = [42000, 68000, 55000, 89000, 72000, 95000];
  const max = Math.max(...values);

  container.innerHTML = `
    <div class="bar-chart">
      ${months.map((m, i) => `
        <div class="bar-item">
          <div class="bar" data-value="${formatCurrency(values[i])}" style="height:${Math.round((values[i]/max)*100)}%;background:linear-gradient(180deg,var(--primary),var(--primary-light))"></div>
          <div class="bar-label">${m}</div>
        </div>`).join('')}
    </div>`;
}

function renderConversionChart() {
  const container = document.getElementById('conversionChart');
  if (!container) return;
  const leads = DB.getAll('leads');
  const statuses = ['new','contacted','qualified','proposal','converted','lost'];
  const counts = statuses.map(s => leads.filter(l => l.status === s).length);
  const total = leads.length || 1;
  const colors = ['#94a3b8','#3b82f6','#6366f1','#8b5cf6','#22c55e','#ef4444'];

  let offset = 0;
  const segments = counts.map((c, i) => {
    const pct = (c / total) * 100;
    const stroke = `conic-gradient`;
    return { pct, color: colors[i], label: capitalize(statuses[i]), count: c };
  });

  const r = 52, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  let strokeOffset = 0;
  const paths = segments.map((seg, i) => {
    const dash = (seg.pct / 100) * circumference;
    const path = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="14" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${-strokeOffset}" />`;
    strokeOffset += dash;
    return path;
  });

  const converted = counts[4];
  const convRate = Math.round((converted / total) * 100);

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div class="donut-chart" style="width:120px;height:120px">
        <svg viewBox="0 0 120 120" style="transform:rotate(-90deg)">
          ${paths.join('')}
        </svg>
        <div class="donut-center">
          <div class="donut-center-value">${convRate}%</div>
          <div class="donut-center-label">Converted</div>
        </div>
      </div>
      <div class="chart-legend" style="flex:1">
        ${segments.map(s => `
          <div class="legend-item">
            <div class="legend-dot" style="background:${s.color}"></div>
            <span>${s.label} (${s.count})</span>
          </div>`).join('')}
      </div>
    </div>`;
}
