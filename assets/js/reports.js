/* ============================================================
   NEXUS CRM — REPORTS & ANALYTICS
   ============================================================ */

let reportDateRange = { start: '', end: '' };

function initReports() {
  initApp('Reports & Analytics');
  setDefaultDateRange();
  renderAllReports();
}

function setDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  reportDateRange.start = start.toISOString().split('T')[0];
  reportDateRange.end = end.toISOString().split('T')[0];
  const startEl = document.getElementById('reportStart');
  const endEl = document.getElementById('reportEnd');
  if (startEl) startEl.value = reportDateRange.start;
  if (endEl) endEl.value = reportDateRange.end;
}

function applyDateRange() {
  reportDateRange.start = document.getElementById('reportStart')?.value || reportDateRange.start;
  reportDateRange.end = document.getElementById('reportEnd')?.value || reportDateRange.end;
  renderAllReports();
}

function renderAllReports() {
  renderSalesPerformance();
  renderLeadConversion();
  renderRevenueForecast();
  renderTaskCompletion();
  renderCustomerGrowth();
  renderTopDeals();
}

function renderSalesPerformance() {
  const el = document.getElementById('salesPerformanceChart');
  if (!el) return;
  const deals = DB.getAll('deals').filter(d => d.stage === 'won');
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');

  const byUser = users.map(u => {
    const userDeals = deals.filter(d => d.owner == u.id);
    return { name: u.name, count: userDeals.length, revenue: userDeals.reduce((s, d) => s + d.value, 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const max = Math.max(...byUser.map(u => u.revenue), 1);

  el.innerHTML = `
    <div class="mb-4">
      ${byUser.map(u => `
        <div class="horizontal-bar">
          <div class="horizontal-bar-label">${escapeHtml(u.name.split(' ')[0])}</div>
          <div class="horizontal-bar-track">
            <div class="horizontal-bar-fill" style="width:${Math.round((u.revenue/max)*100)}%;background:var(--primary)"></div>
          </div>
          <div class="horizontal-bar-value">${formatCurrency(u.revenue)}</div>
        </div>`).join('')}
    </div>
    <div class="chart-legend">
      ${byUser.map(u => `<div class="legend-item"><div class="legend-dot" style="background:var(--primary)"></div><span>${u.name}: ${u.count} deals</span></div>`).join('')}
    </div>`;
}

function renderLeadConversion() {
  const el = document.getElementById('leadConversionChart');
  if (!el) return;
  const leads = DB.getAll('leads');
  const sources = [...new Set(leads.map(l => l.source))];
  const sourceData = sources.map(s => {
    const sLeads = leads.filter(l => l.source === s);
    const converted = sLeads.filter(l => l.status === 'converted').length;
    const rate = sLeads.length ? Math.round((converted / sLeads.length) * 100) : 0;
    return { source: s, total: sLeads.length, converted, rate };
  }).sort((a, b) => b.rate - a.rate);

  const colors = ['#6366f1','#8b5cf6','#0ea5e9','#22c55e','#f59e0b','#ef4444','#14b8a6','#f43f5e'];

  el.innerHTML = `
    <div class="mb-4">
      ${sourceData.map((s, i) => `
        <div class="horizontal-bar">
          <div class="horizontal-bar-label" style="font-size:0.75rem">${escapeHtml(s.source)}</div>
          <div class="horizontal-bar-track">
            <div class="horizontal-bar-fill" style="width:${s.rate}%;background:${colors[i % colors.length]}"></div>
          </div>
          <div class="horizontal-bar-value">${s.rate}%</div>
        </div>`).join('')}
    </div>
    <div style="font-size:0.8rem;color:var(--text-muted)">Conversion rate by lead source</div>`;
}

function renderRevenueForecast() {
  const el = document.getElementById('revenueForecastChart');
  if (!el) return;
  const deals = DB.getAll('deals');
  const stages = DB.getAll('pipelineStages');

  const stageData = stages.map(s => {
    const stageDeals = deals.filter(d => d.stage === s.id);
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
    const weighted = stageDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
    return { ...s, value, weighted, count: stageDeals.length };
  }).filter(s => s.value > 0);

  const max = Math.max(...stageData.map(s => s.value), 1);

  const totalForecast = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + (d.value * d.probability / 100), 0);
  const wonRevenue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);

  el.innerHTML = `
    <div style="display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap">
      <div style="text-align:center;padding:12px 20px;background:var(--success-bg);border-radius:var(--radius)">
        <div style="font-size:1.3rem;font-weight:800;color:var(--success)">${formatCurrency(wonRevenue)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Won Revenue</div>
      </div>
      <div style="text-align:center;padding:12px 20px;background:var(--primary-bg);border-radius:var(--radius)">
        <div style="font-size:1.3rem;font-weight:800;color:var(--primary)">${formatCurrency(totalForecast)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Weighted Forecast</div>
      </div>
    </div>
    ${stageData.map(s => `
      <div class="horizontal-bar">
        <div class="horizontal-bar-label" style="font-size:0.75rem">${s.name}</div>
        <div class="horizontal-bar-track">
          <div class="horizontal-bar-fill" style="width:${Math.round((s.value/max)*100)}%;background:${s.color}"></div>
        </div>
        <div class="horizontal-bar-value">${formatCurrency(s.value)}</div>
      </div>`).join('')}`;
}

function renderTaskCompletion() {
  const el = document.getElementById('taskCompletionChart');
  if (!el) return;
  const tasks = DB.getAll('tasks');
  const total = tasks.length || 1;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate < today).length;

  const completionRate = Math.round((completed / total) * 100);

  const r = 52, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  const segments = [
    { value: completed, color: '#22c55e', label: 'Completed' },
    { value: inProgress, color: '#6366f1', label: 'In Progress' },
    { value: pending - overdue, color: '#f59e0b', label: 'Pending' },
    { value: overdue, color: '#ef4444', label: 'Overdue' }
  ].filter(s => s.value > 0);

  let strokeOffset = 0;
  const paths = segments.map(seg => {
    const dash = (seg.value / total) * circumference;
    const path = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="14" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${-strokeOffset}" />`;
    strokeOffset += dash;
    return path;
  });

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
      <div class="donut-chart" style="width:120px;height:120px;flex-shrink:0">
        <svg viewBox="0 0 120 120" style="transform:rotate(-90deg)">${paths.join('')}</svg>
        <div class="donut-center">
          <div class="donut-center-value">${completionRate}%</div>
          <div class="donut-center-label">Complete</div>
        </div>
      </div>
      <div>
        <div class="chart-legend">
          ${segments.map(s => `<div class="legend-item"><div class="legend-dot" style="background:${s.color}"></div><span>${s.label}: ${s.value}</span></div>`).join('')}
        </div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-muted)">Total: ${total} tasks</div>
      </div>
    </div>`;
}

function renderCustomerGrowth() {
  const el = document.getElementById('customerGrowthChart');
  if (!el) return;
  const customers = DB.getAll('customers');

  // Group by month
  const monthCounts = {};
  customers.forEach(c => {
    const m = c.createdAt ? c.createdAt.substring(0, 7) : '2024-01';
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });

  const months = Object.keys(monthCounts).sort().slice(-6);
  const counts = months.map(m => monthCounts[m] || 0);
  const max = Math.max(...counts, 1);
  const labels = months.map(m => {
    const d = new Date(m + '-01');
    return d.toLocaleDateString('en-US', { month: 'short' });
  });

  const colors = ['#6366f1','#8b5cf6','#0ea5e9','#22c55e','#f59e0b','#ec4899'];

  el.innerHTML = `
    <div class="bar-chart" style="height:120px">
      ${counts.map((c, i) => `
        <div class="bar-item">
          <div class="bar" data-value="${c} new" style="height:${Math.round((c/max)*100)}%;background:${colors[i%colors.length]};border-radius:4px 4px 0 0"></div>
          <div class="bar-label">${labels[i]}</div>
        </div>`).join('')}
    </div>`;
}

function renderTopDeals() {
  const el = document.getElementById('topDealsTable');
  if (!el) return;
  const deals = DB.getAll('deals').sort((a, b) => b.value - a.value).slice(0, 8);

  if (!deals.length) { el.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">No deals yet</p>'; return; }

  el.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead><tr><th>Deal</th><th>Customer</th><th>Value</th><th>Stage</th><th>Probability</th><th>Weighted</th></tr></thead>
        <tbody>
          ${deals.map(d => `
            <tr>
              <td style="font-weight:600">${escapeHtml(d.name)}</td>
              <td>${escapeHtml(d.customerName || '—')}</td>
              <td style="font-weight:700;color:var(--primary)">${formatCurrency(d.value)}</td>
              <td>${statusBadge(d.stage)}</td>
              <td><div style="display:flex;align-items:center;gap:6px"><div class="progress" style="width:50px"><div class="progress-bar ${d.probability>=75?'success':d.probability>=40?'warning':'danger'}" style="width:${d.probability}%"></div></div>${d.probability}%</div></td>
              <td style="font-weight:600;color:var(--success)">${formatCurrency(Math.round(d.value*d.probability/100))}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function exportReport(type) {
  let headers, rows, filename;
  switch (type) {
    case 'sales':
      const deals = DB.getAll('deals');
      headers = ['Deal','Customer','Value','Stage','Probability','Weighted','Close Date','Owner'];
      rows = deals.map(d => [d.name, d.customerName, d.value, d.stage, d.probability+'%', Math.round(d.value*d.probability/100), d.expectedCloseDate, getUserName(d.owner)]);
      filename = 'sales-report.csv';
      break;
    case 'leads':
      const leads = DB.getAll('leads');
      headers = ['Name','Company','Source','Status','Score','Owner','Created'];
      rows = leads.map(l => [l.name, l.company, l.source, l.status, l.score, getUserName(l.owner), l.createdAt]);
      filename = 'lead-report.csv';
      break;
    case 'tasks':
      const tasks = DB.getAll('tasks');
      headers = ['Title','Priority','Status','Due Date','Assigned To','Linked To'];
      rows = tasks.map(t => [t.title, t.priority, t.status, t.dueDate, getUserName(t.assignedTo), t.linkedTo ? `${t.linkedTo.type}:${t.linkedTo.id}` : '']);
      filename = 'task-report.csv';
      break;
    case 'customers':
      const customers = DB.getAll('customers');
      headers = ['Company','Contact','Email','Industry','Status','Revenue','Owner'];
      rows = customers.map(c => [c.name, c.contactPerson, c.email, c.industry, c.status, c.revenue, getUserName(c.owner)]);
      filename = 'customer-report.csv';
      break;
    default:
      return;
  }
  downloadCSV(headers, rows, filename);
  showToast('Report exported as CSV', 'success');
}
