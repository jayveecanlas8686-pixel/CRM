/* ============================================================
   NEXUS CRM — TASKS & CALENDAR
   ============================================================ */

let taskFilters = { search: '', status: '', priority: '', assignedTo: '' };
let calendarDate = new Date();

function initTasks() {
  initApp('Tasks & Follow-ups');
  renderTasks();
  renderTaskStats();
}

function initCalendar() {
  initApp('Calendar');
  renderCalendar();
}

function renderTaskStats() {
  const tasks = DB.getAll('tasks');
  const today = new Date().toISOString().split('T')[0];
  const pending = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const completed = tasks.filter(t => t.status === 'completed');
  const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate < today);
  const el = document.getElementById('taskStats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card"><div class="stat-icon warning"><i class="fas fa-hourglass-half"></i></div><div class="stat-body"><div class="stat-label">Pending</div><div class="stat-value">${pending.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-spinner"></i></div><div class="stat-body"><div class="stat-label">In Progress</div><div class="stat-value">${inProgress.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon success"><i class="fas fa-check-circle"></i></div><div class="stat-body"><div class="stat-label">Completed</div><div class="stat-value">${completed.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon danger"><i class="fas fa-exclamation-circle"></i></div><div class="stat-body"><div class="stat-label">Overdue</div><div class="stat-value">${overdue.length}</div></div></div>`;
}

function renderTasks() {
  const container = document.getElementById('taskList');
  if (!container) return;
  let tasks = DB.getAll('tasks');
  const today = new Date().toISOString().split('T')[0];

  if (taskFilters.search) { const q = taskFilters.search.toLowerCase(); tasks = tasks.filter(t => t.title.toLowerCase().includes(q)); }
  if (taskFilters.status) tasks = tasks.filter(t => t.status === taskFilters.status);
  if (taskFilters.priority) tasks = tasks.filter(t => t.priority === taskFilters.priority);
  if (taskFilters.assignedTo) tasks = tasks.filter(t => t.assignedTo == taskFilters.assignedTo);

  tasks.sort((a, b) => {
    const po = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  document.getElementById('taskCount').textContent = tasks.length + ' tasks';

  if (!tasks.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle"></i><h3>No tasks found</h3><p>Create a new task to get started</p></div>`;
    return;
  }

  container.innerHTML = tasks.map(t => {
    const overdue = t.status !== 'completed' && t.dueDate < today;
    const linkedInfo = t.linkedTo ? getLinkedInfo(t.linkedTo) : '';
    return `
    <div class="task-item fade-in" style="background:var(--bg-card);border:1px solid ${overdue?'var(--danger)':'var(--border)'};border-radius:var(--radius);padding:14px 16px;margin-bottom:10px;transition:all 0.2s;${t.status==='completed'?'opacity:0.65':''}">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <input type="checkbox" ${t.status==='completed'?'checked':''} style="width:16px;height:16px;accent-color:var(--primary);margin-top:2px;cursor:pointer" onchange="completeTask(${t.id}, this.checked)">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
            <span style="font-weight:600;font-size:0.9rem;text-decoration:${t.status==='completed'?'line-through':''}">${escapeHtml(t.title)}</span>
            ${statusBadge(t.status)}
            ${priorityBadge(t.priority)}
            ${overdue ? '<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Overdue</span>' : ''}
          </div>
          ${t.description ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">${escapeHtml(t.description)}</div>` : ''}
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <span style="font-size:0.75rem;color:${overdue?'var(--danger)':'var(--text-muted)'}"><i class="fas fa-calendar-alt"></i> ${overdue?'Overdue · ':''}${formatDate(t.dueDate)}</span>
            <span style="font-size:0.75rem;color:var(--text-muted)"><i class="fas fa-user"></i> ${escapeHtml(getUserName(t.assignedTo))}</span>
            ${linkedInfo ? `<span style="font-size:0.75rem;color:var(--primary)"><i class="fas fa-link"></i> ${linkedInfo}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-ghost btn-icon-sm" onclick="openEditTask(${t.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon-sm" onclick="deleteTask(${t.id})" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getLinkedInfo(linkedTo) {
  if (!linkedTo) return '';
  if (linkedTo.type === 'customer') { const c = DB.getById('customers', linkedTo.id); return c ? `Customer: ${c.name}` : ''; }
  if (linkedTo.type === 'lead') { const l = DB.getById('leads', linkedTo.id); return l ? `Lead: ${l.name}` : ''; }
  if (linkedTo.type === 'deal') { const d = DB.getById('deals', linkedTo.id); return d ? `Deal: ${d.name}` : ''; }
  return '';
}

function openAddTask() {
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  const customers = DB.getAll('customers');
  const leads = DB.getAll('leads').filter(l => l.status !== 'converted' && l.status !== 'lost');
  const deals = DB.getAll('deals').filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const user = Auth.getCurrentUser();
  showModal({
    title: 'Add New Task', size: 'lg',
    body: `
      <div class="form-group"><label class="form-label required">Task Title</label><input class="form-input" id="tTitle" placeholder="Follow-up call with..."></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="tDesc" placeholder="Additional details..." style="min-height:60px"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Due Date</label><input class="form-input" id="tDue" type="date"></div>
        <div class="form-group"><label class="form-label">Priority</label>
          <select class="form-select" id="tPriority">
            <option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Assign To</label>
          <select class="form-select" id="tAssigned">${users.map(u => `<option value="${u.id}" ${u.id==user?.id?'selected':''}>${u.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="tStatus">
            <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Link to Type</label>
          <select class="form-select" id="tLinkType" onchange="updateLinkSelect()">
            <option value="">None</option><option value="customer">Customer</option><option value="lead">Lead</option><option value="deal">Deal</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Link to</label>
          <select class="form-select" id="tLinkId"><option value="">Select...</option></select>
        </div>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveTask()"><i class="fas fa-plus"></i> Add Task</button>`
  });
  const dueInput = document.getElementById('tDue');
  if (dueInput) dueInput.value = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  window._taskLinkData = { customers, leads, deals };
}

function updateLinkSelect() {
  const type = document.getElementById('tLinkType')?.value;
  const sel = document.getElementById('tLinkId');
  if (!sel || !type) { sel.innerHTML = '<option value="">Select...</option>'; return; }
  const data = window._taskLinkData || {};
  const items = data[type + 's'] || [];
  sel.innerHTML = '<option value="">Select...</option>' + items.map(i => `<option value="${i.id}">${escapeHtml(i.name || (i.contactPerson ? i.name : i.name))}</option>`).join('');
}

function openEditTask(id) {
  const t = DB.getById('tasks', id);
  if (!t) return;
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  showModal({
    title: 'Edit Task', size: 'lg',
    body: `
      <input type="hidden" id="tId" value="${t.id}">
      <div class="form-group"><label class="form-label required">Task Title</label><input class="form-input" id="tTitle" value="${escapeHtml(t.title)}"></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="tDesc" style="min-height:60px">${escapeHtml(t.description || '')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Due Date</label><input class="form-input" id="tDue" type="date" value="${t.dueDate}"></div>
        <div class="form-group"><label class="form-label">Priority</label>
          <select class="form-select" id="tPriority">
            ${['low','medium','high','urgent'].map(p => `<option value="${p}" ${t.priority===p?'selected':''}>${capitalize(p)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Assign To</label>
          <select class="form-select" id="tAssigned">${users.map(u => `<option value="${u.id}" ${t.assignedTo==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="tStatus">
            ${['pending','in-progress','completed'].map(s => `<option value="${s}" ${t.status===s?'selected':''}>${capitalize(s.replace('-',' '))}</option>`).join('')}
          </select>
        </div>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveTask()"><i class="fas fa-save"></i> Save Changes</button>`
  });
}

function saveTask() {
  const id = document.getElementById('tId')?.value;
  const title = document.getElementById('tTitle')?.value.trim();
  const dueDate = document.getElementById('tDue')?.value;
  if (!title || !dueDate) { showToast('Title and due date are required', 'error'); return; }

  const isEdit = !!id;
  const task = isEdit ? { ...DB.getById('tasks', parseInt(id)) } : { id: DB.nextId('tasks'), createdAt: new Date().toISOString().split('T')[0], completedAt: null };

  task.title = title;
  task.description = document.getElementById('tDesc')?.value.trim() || '';
  task.dueDate = dueDate;
  task.priority = document.getElementById('tPriority')?.value || 'medium';
  task.assignedTo = parseInt(document.getElementById('tAssigned')?.value) || 1;
  task.status = document.getElementById('tStatus')?.value || 'pending';

  const linkType = document.getElementById('tLinkType')?.value;
  const linkId = document.getElementById('tLinkId')?.value;
  task.linkedTo = linkType && linkId ? { type: linkType, id: parseInt(linkId) } : (isEdit ? task.linkedTo : null);

  if (task.status === 'completed' && !task.completedAt) task.completedAt = new Date().toISOString();
  else if (task.status !== 'completed') task.completedAt = null;

  DB.save('tasks', task);
  if (!isEdit) logActivity('note', `New task created: ${task.title}`, task.linkedTo);
  closeModal();
  renderTasks();
  renderTaskStats();
  showToast(isEdit ? 'Task updated' : 'Task added', 'success');

  // Check overdue automations
  const today = new Date().toISOString().split('T')[0];
  if (task.dueDate < today && task.status !== 'completed') {
    runAutomations('task_overdue', { ...task, linkedTo: task.linkedTo });
  }
}

function completeTask(id, completed) {
  const task = DB.getById('tasks', id);
  if (!task) return;
  task.status = completed ? 'completed' : 'pending';
  task.completedAt = completed ? new Date().toISOString() : null;
  DB.save('tasks', task);
  if (completed) logActivity('task_completed', `Task completed: ${task.title}`, task.linkedTo);
  renderTasks();
  renderTaskStats();
  showToast(completed ? 'Task marked complete!' : 'Task reopened', 'success');
}

function deleteTask(id) {
  const t = DB.getById('tasks', id);
  if (!t) return;
  showConfirm(`Delete task "${t.title}"?`, () => {
    DB.delete('tasks', id);
    renderTasks();
    renderTaskStats();
    showToast('Task deleted', 'success');
  }, { danger: true, confirmText: 'Delete' });
}

function filterTasks() {
  taskFilters.search = document.getElementById('searchTasks')?.value || '';
  taskFilters.status = document.getElementById('filterTaskStatus')?.value || '';
  taskFilters.priority = document.getElementById('filterTaskPriority')?.value || '';
  taskFilters.assignedTo = document.getElementById('filterTaskUser')?.value || '';
  renderTasks();
}

/* ── Calendar ── */
function renderCalendar() {
  const container = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendarMonth');
  if (!container || !monthLabel) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const tasks = DB.getAll('tasks');
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  });

  let cells = '';
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    cells += `<div class="calendar-day other-month"><div class="day-num">${day}</div></div>`;
  }
  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday = dateStr === today;
    const dayTasks = tasksByDate[dateStr] || [];
    cells += `
      <div class="calendar-day ${isToday?'today':''}" onclick="showDayTasks('${dateStr}')">
        <div class="day-num">${day}</div>
        <div class="day-events">
          ${dayTasks.slice(0,3).map(t => `<div class="day-event ${t.priority==='urgent'||t.priority==='high'?'call':'task'}" title="${escapeHtml(t.title)}">${escapeHtml(t.title.substring(0,20))}</div>`).join('')}
          ${dayTasks.length > 3 ? `<div class="day-event task">+${dayTasks.length-3} more</div>` : ''}
        </div>
      </div>`;
  }
  // Fill remaining
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  let nextDay = 1;
  for (let i = firstDay + daysInMonth; i < totalCells; i++) {
    cells += `<div class="calendar-day other-month"><div class="day-num">${nextDay++}</div></div>`;
  }

  container.innerHTML = `
    <div class="calendar-day-header">Sun</div>
    <div class="calendar-day-header">Mon</div>
    <div class="calendar-day-header">Tue</div>
    <div class="calendar-day-header">Wed</div>
    <div class="calendar-day-header">Thu</div>
    <div class="calendar-day-header">Fri</div>
    <div class="calendar-day-header">Sat</div>
    ${cells}`;
}

function prevMonth() { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); }
function goToToday() { calendarDate = new Date(); renderCalendar(); }

function showDayTasks(dateStr) {
  const tasks = DB.getAll('tasks').filter(t => t.dueDate === dateStr);
  const dateLabel = formatDate(dateStr);
  showModal({
    title: `Tasks for ${dateLabel}`,
    body: tasks.length ? tasks.map(t => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:var(--radius);margin-bottom:8px;border:1px solid var(--border)">
        <input type="checkbox" ${t.status==='completed'?'checked':''} style="width:16px;height:16px;accent-color:var(--primary)" onchange="completeTask(${t.id}, this.checked); showDayTasks('${dateStr}')">
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.88rem">${escapeHtml(t.title)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${getUserName(t.assignedTo)}</div>
        </div>
        ${priorityBadge(t.priority)}
      </div>`).join('') :
      '<div class="empty-state" style="padding:24px"><i class="fas fa-calendar-check"></i><p>No tasks for this date</p></div>',
    footer: `<button class="btn btn-outline" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="closeModal();openAddTask()"><i class="fas fa-plus"></i> Add Task</button>`
  });
}

function exportTasks() {
  const tasks = DB.getAll('tasks');
  const headers = ['Title','Description','Due Date','Priority','Status','Assigned To','Linked To','Created'];
  const rows = tasks.map(t => [t.title, t.description, t.dueDate, t.priority, t.status, getUserName(t.assignedTo), t.linkedTo ? `${t.linkedTo.type}:${t.linkedTo.id}` : '', t.createdAt]);
  downloadCSV(headers, rows, 'tasks.csv');
}
