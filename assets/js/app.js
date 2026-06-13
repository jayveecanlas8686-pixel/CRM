/* ============================================================
   NEXUS CRM — SHARED APP UTILITIES
   ============================================================ */

/* ── Navigation config ── */
const NAV_ITEMS = [
  { section: 'Main' },
  { href: 'dashboard.html', icon: 'fa-chart-pie', label: 'Dashboard' },
  { section: 'Sales' },
  { href: 'customers.html', icon: 'fa-building', label: 'Customers' },
  { href: 'leads.html', icon: 'fa-user-plus', label: 'Leads' },
  { href: 'deals.html', icon: 'fa-handshake', label: 'Deals' },
  { href: 'pipeline.html', icon: 'fa-filter', label: 'Pipeline' },
  { section: 'Productivity' },
  { href: 'tasks.html', icon: 'fa-check-square', label: 'Tasks' },
  { href: 'calendar.html', icon: 'fa-calendar', label: 'Calendar' },
  { href: 'activities.html', icon: 'fa-stream', label: 'Activities' },
  { href: 'emails.html', icon: 'fa-envelope', label: 'Emails' },
  { section: 'Tools' },
  { href: 'automation.html', icon: 'fa-bolt', label: 'Automation' },
  { href: 'reports.html', icon: 'fa-chart-bar', label: 'Reports' },
  { section: 'Admin' },
  { href: 'team.html', icon: 'fa-users', label: 'Team' },
  { href: 'settings.html', icon: 'fa-cog', label: 'Settings' },
  { href: 'admin-dashboard.html', icon: 'fa-shield-alt', label: 'Admin', adminOnly: true },
  { href: 'help-center.html', icon: 'fa-question-circle', label: 'Help Center' }
];

/* ── Avatar Colors ── */
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#0ea5e9','#14b8a6','#22c55e','#f59e0b'];
function avatarColor(name) {
  let sum = 0;
  for (let c of (name || 'U')) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
function avatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[parts.length-1][0] : parts[0].substring(0, 2);
}
function avatarHtml(name, size = 'md') {
  const bg = avatarColor(name);
  const init = avatarInitials(name).toUpperCase();
  return `<div class="avatar avatar-${size}" style="background:${bg}">${init}</div>`;
}

/* ── Render Sidebar ── */
function renderSidebar() {
  const el = document.getElementById('sidebar');
  if (!el) return;
  const user = Auth.getCurrentUser();
  if (!user) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const pendingTasks = DB.getAll('tasks').filter(t => t.status !== 'completed').length;

  let nav = '';
  NAV_ITEMS.forEach(item => {
    if (item.section) {
      nav += `<div class="sidebar-section-label">${item.section}</div>`;
    } else {
      if (item.adminOnly && !Auth.hasRole('admin')) return;
      const active = currentPage === item.href ? 'active' : '';
      const badge = item.href === 'tasks.html' && pendingTasks > 0
        ? `<span class="nav-badge">${pendingTasks > 9 ? '9+' : pendingTasks}</span>` : '';
      nav += `<a href="${item.href}" class="${active}"><i class="fas ${item.icon}"></i><span>${item.label}</span>${badge}</a>`;
    }
  });

  el.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">N</div>
      <div class="sidebar-logo-text">Nexus<span>CRM</span></div>
    </div>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="Auth.logout()">
        <div class="sidebar-user-avatar" style="background:${avatarColor(user.name)}">${avatarInitials(user.name).toUpperCase()}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.name}</div>
          <div class="sidebar-user-role">${capitalize(user.role)} · Sign out</div>
        </div>
      </div>
    </div>`;
}

/* ── Render Topbar ── */
function renderTopbar(title = '') {
  const el = document.getElementById('topbar');
  if (!el) return;
  const user = Auth.getCurrentUser();
  if (!user) return;
  const settings = DB.get('settings') || {};
  const theme = settings.theme || 'light';
  el.innerHTML = `
    <button class="topbar-btn mobile-menu-btn" onclick="toggleSidebar()" title="Menu">
      <i class="fas fa-bars"></i>
    </button>
    <div class="topbar-title">${title}</div>
    <div class="topbar-search">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Search customers, leads, deals..." id="globalSearch" onkeyup="globalSearch(this.value)">
    </div>
    <div class="topbar-actions">
      <button class="topbar-btn" onclick="toggleTheme()" title="Toggle theme">
        <i class="fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
      </button>
      <button class="topbar-btn" onclick="window.location.href='tasks.html'" title="Tasks">
        <i class="fas fa-check-square"></i>
        <span class="notif-dot"></span>
      </button>
      <button class="topbar-btn" onclick="window.location.href='activities.html'" title="Activities">
        <i class="fas fa-bell"></i>
      </button>
      <div class="topbar-avatar" style="background:${avatarColor(user.name)}" title="${user.name}"
           onclick="window.location.href='settings.html'">${avatarInitials(user.name).toUpperCase()}</div>
    </div>`;

  // Overlay for mobile
  if (!document.getElementById('sidebarOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    overlay.onclick = toggleSidebar;
    document.body.appendChild(overlay);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

/* ── Theme ── */
function toggleTheme() {
  const settings = DB.get('settings') || {};
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  settings.theme = next;
  DB.set('settings', settings);
  renderTopbar(document.querySelector('.topbar-title')?.textContent || '');
}

/* ── Modal ── */
function showModal(opts = {}) {
  const { title = '', body = '', footer = '', size = '', onShow } = opts;
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');
  if (!overlay || !modal) return;
  modal.className = 'modal' + (size ? ' modal-' + size : '');
  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">${body}</div>
    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}`;
  overlay.classList.add('show');
  if (onShow) setTimeout(onShow, 50);
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('show');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Toast ── */
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info' };
  const defaultTitles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
  const id = 'toast_' + Date.now();
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.id = id;
  t.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type] || 'fa-info'}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${title || defaultTitles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <span class="toast-close" onclick="removeToast('${id}')"><i class="fas fa-times"></i></span>`;
  container.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => removeToast(id), 4000);
}
function removeToast(id) {
  const t = document.getElementById(id);
  if (t) { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }
}

/* ── Confirm Dialog ── */
function showConfirm(message, onConfirm, opts = {}) {
  showModal({
    title: opts.title || 'Confirm Action',
    body: `<p style="color:var(--text-secondary)">${message}</p>`,
    footer: `
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn ${opts.danger ? 'btn-danger' : 'btn-primary'}" id="confirmBtn">${opts.confirmText || 'Confirm'}</button>`
  });
  setTimeout(() => {
    const btn = document.getElementById('confirmBtn');
    if (btn) btn.onclick = () => { closeModal(); onConfirm(); };
  }, 50);
}

/* ── Utilities ── */
function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  if (includeTime) opts.hour = '2-digit', opts.minute = '2-digit';
  return d.toLocaleDateString('en-US', opts);
}
function formatDateRelative(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return formatDate(dateStr);
}
function formatCurrency(n) {
  const settings = DB.get('settings') || {};
  const currency = settings.currency || 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function generateId() { return Date.now() + Math.floor(Math.random() * 1000); }
function debounce(fn, wait = 300) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getUserName(id) { const u = DB.getById('users', id); return u ? u.name : 'Unknown'; }
function getCustomerName(id) { const c = DB.getById('customers', id); return c ? c.name : 'Unknown'; }

/* ── Log Activity ── */
function logActivity(type, description, relatedTo) {
  const user = Auth.getCurrentUser();
  const icons = { call: 'fa-phone', meeting: 'fa-users', email: 'fa-envelope', note: 'fa-sticky-note', status_update: 'fa-arrow-right', task_completed: 'fa-check-circle', customer_created: 'fa-building', lead_created: 'fa-user-plus', deal_created: 'fa-handshake' };
  const activity = {
    id: DB.nextId('activities'),
    type, icon: icons[type] || 'fa-circle',
    description, relatedTo: relatedTo || null,
    createdBy: user ? user.id : 1,
    createdByName: user ? user.name : 'System',
    createdAt: new Date().toISOString()
  };
  DB.save('activities', activity);
}

/* ── Status Badge ── */
function statusBadge(status) {
  const map = {
    active: 'badge-success', inactive: 'badge-gray', prospect: 'badge-info',
    new: 'badge-info', contacted: 'badge-accent', qualified: 'badge-primary', proposal: 'badge-secondary', converted: 'badge-success', lost: 'badge-danger',
    prospecting: 'badge-gray', qualification: 'badge-info', negotiation: 'badge-warning', won: 'badge-success',
    pending: 'badge-warning', 'in-progress': 'badge-primary', completed: 'badge-success',
    sent: 'badge-primary', received: 'badge-info',
    open: 'badge-warning', closed: 'badge-gray', resolved: 'badge-success',
    admin: 'badge-danger', manager: 'badge-primary', agent: 'badge-success', viewer: 'badge-gray',
    urgent: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-gray'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${capitalize(status || '—')}</span>`;
}

/* ── Global Search ── */
function globalSearch(q) {
  if (!q || q.length < 2) return;
  q = q.toLowerCase();
  const customers = DB.getAll('customers').filter(c => c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  const leads = DB.getAll('leads').filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
  const deals = DB.getAll('deals').filter(d => d.name.toLowerCase().includes(q));
  // Could show a results dropdown — for demo, redirect to best match
  if (customers.length) window.location.href = `customers.html`;
}

/* ── Priority Badge ── */
function priorityBadge(priority) {
  const icons = { urgent: 'fa-exclamation-circle', high: 'fa-arrow-up', medium: 'fa-minus', low: 'fa-arrow-down' };
  return `<span class="badge ${priority === 'urgent' ? 'badge-danger' : priority === 'high' ? 'badge-warning' : priority === 'medium' ? 'badge-info' : 'badge-gray'}"><i class="fas ${icons[priority] || 'fa-minus'}"></i> ${capitalize(priority)}</span>`;
}

/* ── Run Automations ── */
function runAutomations(trigger, context = {}) {
  const automations = DB.getAll('automations').filter(a => a.enabled && a.trigger.type === trigger);
  automations.forEach(rule => {
    let match = false;
    if (trigger === 'lead_status' && context.status === rule.trigger.value) match = true;
    else if (trigger === 'deal_stage' && context.stage === rule.trigger.value) match = true;
    else if (trigger === 'customer_created') match = true;
    else if (trigger === 'task_overdue') match = true;
    else if (trigger === 'lead_inactive') match = true;

    if (match) {
      const desc = rule.action.template
        .replace('{{lead_name}}', context.name || '')
        .replace('{{customer_name}}', context.customerName || context.name || '')
        .replace('{{deal_name}}', context.name || '')
        .replace('{{customer_email}}', context.email || '');

      if (rule.action.type === 'create_task') {
        const user = Auth.getCurrentUser();
        const task = {
          id: DB.nextId('tasks'),
          title: desc,
          description: `Auto-created by automation: ${rule.name}`,
          assignedTo: user ? user.id : 1,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          priority: 'high',
          status: 'pending',
          linkedTo: context.linkedTo || null,
          createdAt: new Date().toISOString().split('T')[0],
          completedAt: null
        };
        DB.save('tasks', task);
      } else if (rule.action.type === 'log_activity') {
        logActivity('status_update', desc, context.linkedTo);
      }

      rule.lastRun = new Date().toISOString();
      rule.runs = (rule.runs || 0) + 1;
      DB.save('automations', rule);
    }
  });
}

/* ── Init App Shell ── */
function initApp(pageTitle) {
  Auth.requireAuth();
  renderSidebar();
  renderTopbar(pageTitle);
  const settings = DB.get('settings') || {};
  if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
}
