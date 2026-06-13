/* ============================================================
   NEXUS CRM — DEALS & PIPELINE
   ============================================================ */

let dealFilters = { search: '', stage: '', owner: '' };
let draggedDealId = null;

function initDeals() {
  initApp('Deals');
  renderDeals();
  renderDealStats();
}

function initPipeline() {
  initApp('Sales Pipeline');
  renderPipeline();
  renderPipelineStats();
}

function renderDealStats() {
  const deals = DB.getAll('deals');
  const active = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const won = deals.filter(d => d.stage === 'won');
  const lost = deals.filter(d => d.stage === 'lost');
  const forecast = active.reduce((s, d) => s + (d.value * d.probability / 100), 0);
  const wonTotal = won.reduce((s, d) => s + d.value, 0);
  const el = document.getElementById('dealStats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-handshake"></i></div><div class="stat-body"><div class="stat-label">Active Deals</div><div class="stat-value">${active.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon success"><i class="fas fa-trophy"></i></div><div class="stat-body"><div class="stat-label">Won Deals</div><div class="stat-value">${won.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon warning"><i class="fas fa-chart-line"></i></div><div class="stat-body"><div class="stat-label">Revenue Forecast</div><div class="stat-value">${formatCurrency(forecast)}</div></div></div>
    <div class="stat-card"><div class="stat-icon accent"><i class="fas fa-dollar-sign"></i></div><div class="stat-body"><div class="stat-label">Won Revenue</div><div class="stat-value">${formatCurrency(wonTotal)}</div></div></div>`;
}

function renderDeals() {
  const container = document.getElementById('dealTableBody');
  if (!container) return;
  let deals = DB.getAll('deals');

  if (dealFilters.search) {
    const q = dealFilters.search.toLowerCase();
    deals = deals.filter(d => d.name.toLowerCase().includes(q) || (d.customerName||'').toLowerCase().includes(q));
  }
  if (dealFilters.stage) deals = deals.filter(d => d.stage === dealFilters.stage);
  if (dealFilters.owner) deals = deals.filter(d => d.owner == dealFilters.owner);

  deals.sort((a, b) => b.value - a.value);
  document.getElementById('dealCount').textContent = deals.length + ' deals';

  if (!deals.length) {
    container.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-handshake"></i><h3>No deals found</h3><p>Add a new deal to get started</p></div></td></tr>`;
    return;
  }

  container.innerHTML = deals.map(d => `
    <tr>
      <td>
        <div style="font-weight:600">${escapeHtml(d.name)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(d.customerName || '')}</div>
      </td>
      <td style="font-weight:700;color:var(--primary)">${formatCurrency(d.value)}</td>
      <td>${statusBadge(d.stage)}</td>
      <td>
        <div class="flex items-center gap-2">
          <div class="progress" style="width:60px"><div class="progress-bar ${d.probability>=75?'success':d.probability>=40?'warning':'danger'}" style="width:${d.probability}%"></div></div>
          <span style="font-size:0.8rem;font-weight:600">${d.probability}%</span>
        </div>
      </td>
      <td>${formatCurrency(Math.round(d.value * d.probability / 100))}</td>
      <td>${formatDate(d.expectedCloseDate)}</td>
      <td>${escapeHtml(getUserName(d.owner))}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon-sm" onclick="openEditDeal(${d.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon-sm" onclick="quickMoveDeal(${d.id})" title="Move Stage" style="color:var(--primary)"><i class="fas fa-arrows-alt-h"></i></button>
          <button class="btn btn-ghost btn-icon-sm" onclick="deleteDeal(${d.id})" title="Delete" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddDeal() {
  const customers = DB.getAll('customers');
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  const stages = DB.getAll('pipelineStages');
  showModal({
    title: 'Add New Deal', size: 'lg',
    body: `
      <div class="form-group"><label class="form-label required">Deal Name</label><input class="form-input" id="dName" placeholder="Enterprise License - Company Name"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Value ($)</label><input class="form-input" id="dValue" type="number" placeholder="25000"></div>
        <div class="form-group"><label class="form-label">Customer</label>
          <select class="form-select" id="dCustomer">
            <option value="">Select Customer</option>
            ${customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Stage</label>
          <select class="form-select" id="dStage" onchange="updateDealProbability(this)">
            ${stages.filter(s=>s.id!=='won'&&s.id!=='lost').map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Probability (%)</label><input class="form-input" id="dProbability" type="number" min="0" max="100" value="20"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Expected Close Date</label><input class="form-input" id="dClose" type="date"></div>
        <div class="form-group"><label class="form-label">Owner</label>
          <select class="form-select" id="dOwner">${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="dNotes" placeholder="Deal notes..." style="min-height:72px"></textarea></div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDeal()"><i class="fas fa-plus"></i> Add Deal</button>`
  });
  // Set default close date to 30 days from now
  const closeInput = document.getElementById('dClose');
  if (closeInput) closeInput.value = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
}

function openEditDeal(id) {
  const d = DB.getById('deals', id);
  if (!d) return;
  const customers = DB.getAll('customers');
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  const stages = DB.getAll('pipelineStages');
  showModal({
    title: 'Edit Deal', size: 'lg',
    body: `
      <input type="hidden" id="dId" value="${d.id}">
      <div class="form-group"><label class="form-label required">Deal Name</label><input class="form-input" id="dName" value="${escapeHtml(d.name)}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Value ($)</label><input class="form-input" id="dValue" type="number" value="${d.value}"></div>
        <div class="form-group"><label class="form-label">Customer</label>
          <select class="form-select" id="dCustomer">
            <option value="">Select Customer</option>
            ${customers.map(c => `<option value="${c.id}" ${d.customerId==c.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Stage</label>
          <select class="form-select" id="dStage" onchange="updateDealProbability(this)">
            ${stages.map(s => `<option value="${s.id}" ${d.stage===s.id?'selected':''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Probability (%)</label><input class="form-input" id="dProbability" type="number" min="0" max="100" value="${d.probability}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Expected Close Date</label><input class="form-input" id="dClose" type="date" value="${d.expectedCloseDate}"></div>
        <div class="form-group"><label class="form-label">Owner</label>
          <select class="form-select" id="dOwner">${users.map(u => `<option value="${u.id}" ${d.owner==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="dNotes" style="min-height:72px">${escapeHtml(d.notes || '')}</textarea></div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDeal()"><i class="fas fa-save"></i> Save Changes</button>`
  });
}

function updateDealProbability(sel) {
  const stages = DB.getAll('pipelineStages');
  const stage = stages.find(s => s.id === sel.value);
  if (stage) { const p = document.getElementById('dProbability'); if (p) p.value = stage.probability; }
}

function saveDeal() {
  const id = document.getElementById('dId')?.value;
  const name = document.getElementById('dName')?.value.trim();
  const value = parseInt(document.getElementById('dValue')?.value) || 0;
  const closeDate = document.getElementById('dClose')?.value;
  if (!name || !closeDate) { showToast('Name and close date are required', 'error'); return; }

  const isEdit = !!id;
  const prevDeal = isEdit ? DB.getById('deals', parseInt(id)) : null;
  const deal = isEdit ? { ...prevDeal } : { id: DB.nextId('deals'), createdAt: new Date().toISOString().split('T')[0] };

  deal.name = name;
  deal.value = value;
  const customerId = parseInt(document.getElementById('dCustomer')?.value) || null;
  deal.customerId = customerId;
  deal.customerName = customerId ? getCustomerName(customerId) : '';
  deal.stage = document.getElementById('dStage')?.value || 'prospecting';
  deal.probability = parseInt(document.getElementById('dProbability')?.value) || 0;
  deal.expectedCloseDate = closeDate;
  deal.owner = parseInt(document.getElementById('dOwner')?.value) || 1;
  deal.notes = document.getElementById('dNotes')?.value.trim() || '';

  const stageChanged = prevDeal && prevDeal.stage !== deal.stage;
  DB.save('deals', deal);

  if (!isEdit) {
    logActivity('deal_created', `New deal created: ${deal.name} worth ${formatCurrency(deal.value)}`, { type: 'deal', id: deal.id, name: deal.name });
    runAutomations('deal_stage', { ...deal, linkedTo: { type: 'deal', id: deal.id } });
  } else if (stageChanged) {
    logActivity('status_update', `Deal "${deal.name}" moved to ${deal.stage} stage`, { type: 'deal', id: deal.id, name: deal.name });
    runAutomations('deal_stage', { ...deal, linkedTo: { type: 'deal', id: deal.id } });
  }

  closeModal();
  if (document.getElementById('dealTableBody')) renderDeals(), renderDealStats();
  if (document.getElementById('kanbanBoard')) renderPipeline(), renderPipelineStats();
  showToast(isEdit ? 'Deal updated' : 'Deal added', 'success');
}

function deleteDeal(id) {
  const d = DB.getById('deals', id);
  if (!d) return;
  showConfirm(`Delete deal "${d.name}"?`, () => {
    DB.delete('deals', id);
    if (document.getElementById('dealTableBody')) renderDeals(), renderDealStats();
    if (document.getElementById('kanbanBoard')) renderPipeline();
    showToast('Deal deleted', 'success');
  }, { danger: true, confirmText: 'Delete' });
}

function filterDeals() {
  dealFilters.search = document.getElementById('searchDeals')?.value || '';
  dealFilters.stage = document.getElementById('filterDealStage')?.value || '';
  dealFilters.owner = document.getElementById('filterDealOwner')?.value || '';
  renderDeals();
}

function exportDeals() {
  const deals = DB.getAll('deals');
  const headers = ['Name','Customer','Value','Stage','Probability','Weighted','Close Date','Owner','Created'];
  const rows = deals.map(d => [d.name, d.customerName, d.value, d.stage, d.probability+'%', Math.round(d.value*d.probability/100), d.expectedCloseDate, getUserName(d.owner), d.createdAt]);
  downloadCSV(headers, rows, 'deals.csv');
}

function quickMoveDeal(id) {
  const d = DB.getById('deals', id);
  if (!d) return;
  const stages = DB.getAll('pipelineStages');
  showModal({
    title: 'Move Deal Stage',
    body: `
      <p style="color:var(--text-secondary);margin-bottom:16px">Select a new stage for "<strong>${escapeHtml(d.name)}</strong>"</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${stages.map(s => `
          <button class="btn ${d.stage===s.id?'btn-primary':'btn-outline'}" onclick="moveDealToStage(${d.id},'${s.id}')" style="justify-content:flex-start;gap:10px">
            <span style="width:10px;height:10px;border-radius:99px;background:${s.color};flex-shrink:0"></span>
            ${s.name} <span style="margin-left:auto;font-size:0.75rem;opacity:0.7">${s.probability}%</span>
          </button>`).join('')}
      </div>`
  });
}

function moveDealToStage(dealId, stage) {
  const deal = DB.getById('deals', dealId);
  if (!deal) return;
  const stages = DB.getAll('pipelineStages');
  const stageObj = stages.find(s => s.id === stage);
  const prevStage = deal.stage;
  deal.stage = stage;
  deal.probability = stageObj ? stageObj.probability : deal.probability;
  DB.save('deals', deal);
  logActivity('status_update', `Deal "${deal.name}" moved from ${prevStage} to ${stage}`, { type: 'deal', id: deal.id, name: deal.name });
  runAutomations('deal_stage', { ...deal, linkedTo: { type: 'deal', id: deal.id } });
  closeModal();
  if (document.getElementById('dealTableBody')) renderDeals();
  if (document.getElementById('kanbanBoard')) renderPipeline();
  showToast(`Deal moved to ${stage}`, 'success');
}

/* ── Pipeline Kanban ── */
function renderPipeline() {
  const board = document.getElementById('kanbanBoard');
  if (!board) return;
  const stages = DB.getAll('pipelineStages');
  const deals = DB.getAll('deals');

  board.innerHTML = stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage.id);
    const total = stageDeals.reduce((s, d) => s + d.value, 0);
    return `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="kanban-column-header">
          <div class="flex items-center gap-2">
            <span style="width:10px;height:10px;border-radius:99px;background:${stage.color}"></span>
            <span class="kanban-column-title">${stage.name}</span>
          </div>
          <span class="kanban-column-count">${stageDeals.length}</span>
        </div>
        <div class="kanban-column-total">${formatCurrency(total)}</div>
        <div class="kanban-cards" id="stage_${stage.id}"
          ondragover="dragOver(event)"
          ondrop="drop(event, '${stage.id}')"
          ondragenter="dragEnter(event)"
          ondragleave="dragLeave(event)">
          ${stageDeals.map(d => renderKanbanCard(d)).join('')}
        </div>
        <button class="btn btn-ghost btn-sm w-full mt-2" onclick="openAddDealInStage('${stage.id}')" style="color:var(--text-muted);font-size:0.78rem"><i class="fas fa-plus"></i> Add Deal</button>
      </div>`;
  }).join('');
}

function renderKanbanCard(d) {
  const today = new Date().toISOString().split('T')[0];
  const overdue = d.expectedCloseDate < today && d.stage !== 'won' && d.stage !== 'lost';
  return `
    <div class="kanban-card" draggable="true"
      ondragstart="dragStart(event, ${d.id})"
      ondragend="dragEnd(event)">
      <div class="kanban-card-title">${escapeHtml(d.name)}</div>
      <div class="kanban-card-company">${escapeHtml(d.customerName || '')}</div>
      <div style="margin-bottom:8px">
        <div class="progress" style="height:4px"><div class="progress-bar" style="width:${d.probability}%;background:${d.probability>=75?'var(--success)':d.probability>=40?'var(--warning)':'var(--danger)'}"></div></div>
      </div>
      <div class="kanban-card-meta">
        <span class="kanban-card-value">${formatCurrency(d.value)}</span>
        <span class="kanban-card-date" style="color:${overdue?'var(--danger)':'var(--text-muted)'}">${overdue?'⚠ ':''}${formatDate(d.expectedCloseDate)}</span>
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between">
        ${avatarHtml(getUserName(d.owner), 'sm')}
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-icon-sm" onclick="openEditDeal(${d.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon-sm" onclick="deleteDeal(${d.id})" title="Delete" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
}

function openAddDealInStage(stage) {
  openAddDeal();
  setTimeout(() => {
    const sel = document.getElementById('dStage');
    if (sel) { sel.value = stage; updateDealProbability(sel); }
  }, 100);
}

function renderPipelineStats() {
  const el = document.getElementById('pipelineStats');
  if (!el) return;
  const deals = DB.getAll('deals').filter(d => d.stage !== 'lost');
  const total = deals.length;
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const forecast = deals.reduce((s, d) => s + (d.value * d.probability / 100), 0);
  el.innerHTML = `
    <div class="pipeline-summary-item"><div class="pipeline-summary-value">${total}</div><div class="pipeline-summary-label">Total Deals</div></div>
    <div class="pipeline-summary-item"><div class="pipeline-summary-value">${formatCurrency(totalValue)}</div><div class="pipeline-summary-label">Pipeline Value</div></div>
    <div class="pipeline-summary-item"><div class="pipeline-summary-value">${formatCurrency(forecast)}</div><div class="pipeline-summary-label">Weighted Forecast</div></div>`;
}

/* ── Drag and Drop ── */
function dragStart(event, dealId) {
  draggedDealId = dealId;
  event.dataTransfer.setData('text/plain', dealId);
  event.currentTarget.classList.add('dragging');
}
function dragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  draggedDealId = null;
}
function dragOver(event) { event.preventDefault(); event.currentTarget.classList.add('drag-active'); }
function dragEnter(event) { event.preventDefault(); event.currentTarget.classList.add('drag-active'); }
function dragLeave(event) { event.currentTarget.classList.remove('drag-active'); }
function drop(event, stage) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-active');
  const id = parseInt(event.dataTransfer.getData('text/plain') || draggedDealId);
  if (!id) return;
  moveDealToStage(id, stage);
}
