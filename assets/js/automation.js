/* ============================================================
   NEXUS CRM — AUTOMATION BUILDER
   ============================================================ */

function initAutomation() {
  initApp('Automation Builder');
  renderAutomations();
  renderAutomationStats();
}

function renderAutomationStats() {
  const automations = DB.getAll('automations');
  const enabled = automations.filter(a => a.enabled).length;
  const totalRuns = automations.reduce((s, a) => s + (a.runs || 0), 0);
  const el = document.getElementById('automationStats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-bolt"></i></div><div class="stat-body"><div class="stat-label">Total Rules</div><div class="stat-value">${automations.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon success"><i class="fas fa-toggle-on"></i></div><div class="stat-body"><div class="stat-label">Active Rules</div><div class="stat-value">${enabled}</div></div></div>
    <div class="stat-card"><div class="stat-icon accent"><i class="fas fa-play-circle"></i></div><div class="stat-body"><div class="stat-label">Total Runs</div><div class="stat-value">${totalRuns}</div></div></div>
    <div class="stat-card"><div class="stat-icon warning"><i class="fas fa-clock"></i></div><div class="stat-body"><div class="stat-label">Disabled</div><div class="stat-value">${automations.length - enabled}</div></div></div>`;
}

function renderAutomations() {
  const container = document.getElementById('automationList');
  if (!container) return;
  const automations = DB.getAll('automations');

  if (!automations.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-bolt"></i><h3>No automation rules</h3><p>Create your first automation to streamline your workflow</p></div>`;
    return;
  }

  const triggerLabels = {
    lead_status: 'When lead status changes to',
    deal_stage: 'When deal moves to stage',
    customer_created: 'When new customer is added',
    task_overdue: 'When task becomes overdue',
    lead_inactive: 'When lead has no activity for'
  };
  const actionLabels = {
    create_task: 'Create follow-up task',
    send_email: 'Send email',
    log_activity: 'Log activity note',
    update_priority: 'Update task priority'
  };

  container.innerHTML = automations.map(a => `
    <div class="automation-card mb-3">
      <div class="automation-icon"><i class="fas fa-bolt"></i></div>
      <div class="automation-info">
        <div class="automation-name">${escapeHtml(a.name)}</div>
        <div class="automation-desc">
          <span style="color:var(--warning)">${triggerLabels[a.trigger.type] || a.trigger.type}</span>
          ${a.trigger.value ? `<strong> "${capitalize(a.trigger.value)}"</strong>` : ''}
          <span style="color:var(--text-muted)"> → </span>
          <span style="color:var(--success)">${actionLabels[a.action.type] || a.action.type}</span>
        </div>
        <div class="automation-meta">
          <span class="badge badge-gray text-xs"><i class="fas fa-play"></i> ${a.runs || 0} runs</span>
          ${a.lastRun ? `<span style="font-size:0.72rem;color:var(--text-muted)">Last run: ${formatDateRelative(a.lastRun)}</span>` : '<span style="font-size:0.72rem;color:var(--text-muted)">Never run</span>'}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
        <label class="toggle-switch" title="${a.enabled?'Disable':'Enable'} automation">
          <input type="checkbox" ${a.enabled?'checked':''} onchange="toggleAutomation(${a.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <button class="btn btn-ghost btn-icon-sm" onclick="openEditAutomation(${a.id})" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon-sm" onclick="deleteAutomation(${a.id})" title="Delete" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function openAddAutomation() {
  showModal({
    title: 'Create Automation Rule', size: 'lg',
    body: `
      <div class="form-group"><label class="form-label required">Rule Name</label><input class="form-input" id="aName" placeholder="e.g. Qualified Lead Follow-up"></div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:12px;color:var(--warning)"><i class="fas fa-bolt"></i> Trigger: When this happens...</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Trigger Event</label>
            <select class="form-select" id="aTriggerType" onchange="updateTriggerValue()">
              <option value="lead_status">Lead status changes to</option>
              <option value="deal_stage">Deal moves to stage</option>
              <option value="customer_created">New customer is added</option>
              <option value="task_overdue">Task becomes overdue</option>
              <option value="lead_inactive">Lead inactive for X days</option>
            </select>
          </div>
          <div class="form-group" id="triggerValueGroup"><label class="form-label">Value</label>
            <select class="form-select" id="aTriggerValue">
              <option value="new">New</option><option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option><option value="proposal">Proposal</option>
              <option value="converted">Converted</option><option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:12px;color:var(--success)"><i class="fas fa-arrow-right"></i> Action: Then do this...</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Action Type</label>
            <select class="form-select" id="aActionType">
              <option value="create_task">Create follow-up task</option>
              <option value="log_activity">Log activity note</option>
              <option value="update_priority">Update task priority</option>
              <option value="send_email">Send email notification</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Message / Template</label>
            <input class="form-input" id="aActionTemplate" placeholder="e.g. Follow up with {{lead_name}}">
          </div>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Variables: {{lead_name}}, {{customer_name}}, {{deal_name}}, {{customer_email}}</div>
      </div>
      <div class="form-check">
        <input type="checkbox" id="aEnabled" checked>
        <label class="form-check-label">Enable this automation immediately</label>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAutomation()"><i class="fas fa-plus"></i> Create Rule</button>`
  });
}

function updateTriggerValue() {
  const type = document.getElementById('aTriggerType')?.value;
  const group = document.getElementById('triggerValueGroup');
  const sel = document.getElementById('aTriggerValue');
  if (!group || !sel) return;

  const options = {
    lead_status: [['new','New'],['contacted','Contacted'],['qualified','Qualified'],['proposal','Proposal'],['converted','Converted'],['lost','Lost']],
    deal_stage: [['prospecting','Prospecting'],['qualification','Qualification'],['proposal','Proposal'],['negotiation','Negotiation'],['won','Won'],['lost','Lost']],
    customer_created: [],
    task_overdue: [],
    lead_inactive: [['7','7 days'],['14','14 days'],['30','30 days']]
  };

  const opts = options[type] || [];
  if (!opts.length) {
    group.style.display = 'none';
  } else {
    group.style.display = 'block';
    sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    sel.tagName === 'SELECT' ? null : null;
  }
}

function openEditAutomation(id) {
  const a = DB.getById('automations', id);
  if (!a) return;
  showModal({
    title: 'Edit Automation Rule', size: 'lg',
    body: `
      <input type="hidden" id="aId" value="${a.id}">
      <div class="form-group"><label class="form-label required">Rule Name</label><input class="form-input" id="aName" value="${escapeHtml(a.name)}"></div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:12px;color:var(--warning)"><i class="fas fa-bolt"></i> Trigger</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Event</label>
            <select class="form-select" id="aTriggerType">
              ${[['lead_status','Lead status changes to'],['deal_stage','Deal moves to stage'],['customer_created','New customer added'],['task_overdue','Task overdue'],['lead_inactive','Lead inactive']].map(([v,l]) => `<option value="${v}" ${a.trigger.type===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Value</label>
            <input class="form-input" id="aTriggerValue" value="${a.trigger.value || ''}">
          </div>
        </div>
      </div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:12px;color:var(--success)"><i class="fas fa-arrow-right"></i> Action</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Action Type</label>
            <select class="form-select" id="aActionType">
              ${[['create_task','Create task'],['log_activity','Log activity'],['update_priority','Update priority'],['send_email','Send email']].map(([v,l]) => `<option value="${v}" ${a.action.type===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Template</label>
            <input class="form-input" id="aActionTemplate" value="${escapeHtml(a.action.template || '')}">
          </div>
        </div>
      </div>
      <div class="form-check">
        <input type="checkbox" id="aEnabled" ${a.enabled?'checked':''}>
        <label class="form-check-label">Rule is active</label>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAutomation()"><i class="fas fa-save"></i> Save Changes</button>`
  });
}

function saveAutomation() {
  const id = document.getElementById('aId')?.value;
  const name = document.getElementById('aName')?.value.trim();
  if (!name) { showToast('Rule name is required', 'error'); return; }

  const isEdit = !!id;
  const auto = isEdit ? { ...DB.getById('automations', parseInt(id)) } : { id: DB.nextId('automations'), runs: 0, lastRun: null, createdAt: new Date().toISOString().split('T')[0] };

  auto.name = name;
  auto.trigger = {
    type: document.getElementById('aTriggerType')?.value || 'lead_status',
    value: document.getElementById('aTriggerValue')?.value || null
  };
  auto.action = {
    type: document.getElementById('aActionType')?.value || 'create_task',
    template: document.getElementById('aActionTemplate')?.value.trim() || ''
  };
  auto.enabled = document.getElementById('aEnabled')?.checked !== false;

  DB.save('automations', auto);
  closeModal();
  renderAutomations();
  renderAutomationStats();
  showToast(isEdit ? 'Automation updated' : 'Automation created', 'success');
}

function toggleAutomation(id, enabled) {
  const a = DB.getById('automations', id);
  if (!a) return;
  a.enabled = enabled;
  DB.save('automations', a);
  renderAutomations();
  renderAutomationStats();
  showToast(`Automation ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

function deleteAutomation(id) {
  const a = DB.getById('automations', id);
  if (!a) return;
  showConfirm(`Delete automation "${a.name}"?`, () => {
    DB.delete('automations', id);
    renderAutomations();
    renderAutomationStats();
    showToast('Automation deleted', 'success');
  }, { danger: true, confirmText: 'Delete' });
}

function simulateAutomations() {
  const automations = DB.getAll('automations').filter(a => a.enabled);
  if (!automations.length) { showToast('No active automations to run', 'warning'); return; }

  const leads = DB.getAll('leads');
  const deals = DB.getAll('deals');
  const tasks = DB.getAll('tasks');
  const today = new Date().toISOString().split('T')[0];

  let count = 0;

  // Check overdue tasks
  tasks.filter(t => t.status !== 'completed' && t.dueDate < today).forEach(t => {
    runAutomations('task_overdue', { ...t, linkedTo: { type: 'task', id: t.id } });
    count++;
  });

  // Check qualified leads
  leads.filter(l => l.status === 'qualified').forEach(l => {
    runAutomations('lead_status', { ...l, linkedTo: { type: 'lead', id: l.id } });
    count++;
  });

  // Check proposal deals
  deals.filter(d => d.stage === 'proposal').forEach(d => {
    runAutomations('deal_stage', { ...d, linkedTo: { type: 'deal', id: d.id } });
    count++;
  });

  renderAutomations();
  renderAutomationStats();
  showToast(`Simulation complete! Processed ${count} events.`, 'success', 'Automation Run');
}
