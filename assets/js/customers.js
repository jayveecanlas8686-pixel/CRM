/* ============================================================
   NEXUS CRM — CUSTOMERS
   ============================================================ */

let customerFilters = { search: '', status: '', industry: '', owner: '' };
let customerSort = { col: 'name', dir: 'asc' };

function initCustomers() {
  initApp('Customers');
  renderCustomers();
  populateFilterUsers();
}

function populateFilterUsers() {
  const sel = document.getElementById('filterOwner');
  if (!sel) return;
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  sel.innerHTML = '<option value="">All Owners</option>' + users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

function renderCustomers() {
  const container = document.getElementById('customerTableBody');
  if (!container) return;
  let customers = DB.getAll('customers');

  if (customerFilters.search) {
    const q = customerFilters.search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q));
  }
  if (customerFilters.status) customers = customers.filter(c => c.status === customerFilters.status);
  if (customerFilters.industry) customers = customers.filter(c => c.industry === customerFilters.industry);
  if (customerFilters.owner) customers = customers.filter(c => c.owner == customerFilters.owner);

  customers.sort((a, b) => {
    let av = a[customerSort.col] || '', bv = b[customerSort.col] || '';
    if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
    if (av < bv) return customerSort.dir === 'asc' ? -1 : 1;
    if (av > bv) return customerSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  document.getElementById('customerCount').textContent = customers.length + ' customers';

  if (!customers.length) {
    container.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-building"></i><h3>No customers found</h3><p>Try adjusting your filters or add a new customer</p></div></td></tr>`;
    return;
  }

  container.innerHTML = customers.map(c => `
    <tr>
      <td>
        <div class="flex items-center gap-2">
          ${avatarHtml(c.name, 'sm')}
          <div>
            <div style="font-weight:600">${escapeHtml(c.name)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(c.industry || '')}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight:500">${escapeHtml(c.contactPerson)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(c.email)}</div>
      </td>
      <td>${escapeHtml(c.phone || '—')}</td>
      <td>${escapeHtml(c.location || '—')}</td>
      <td>${statusBadge(c.status)}</td>
      <td style="font-weight:700;color:var(--success)">${formatCurrency(c.revenue)}</td>
      <td>${escapeHtml(getUserName(c.owner))}</td>
      <td>
        <div class="td-actions">
          <a href="customer-details.html?id=${c.id}" class="btn btn-ghost btn-icon-sm" title="View"><i class="fas fa-eye"></i></a>
          <button class="btn btn-ghost btn-icon-sm" onclick="openEditCustomer(${c.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon-sm" onclick="deleteCustomer(${c.id})" title="Delete" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddCustomer() {
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  showModal({
    title: 'Add New Customer', size: 'lg',
    body: `
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Company Name</label><input class="form-input" id="cName" placeholder="Acme Corporation"></div>
        <div class="form-group"><label class="form-label required">Contact Person</label><input class="form-input" id="cContact" placeholder="John Smith"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Email</label><input class="form-input" id="cEmail" type="email" placeholder="john@acme.com"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="cPhone" placeholder="+1-555-0000"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Industry</label>
          <select class="form-select" id="cIndustry">
            <option value="">Select Industry</option>
            ${['Technology','SaaS','Finance','Healthcare','Retail','Consulting','Logistics','Education','Manufacturing','Other'].map(i => `<option>${i}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="cStatus">
            <option value="active">Active</option><option value="inactive">Inactive</option><option value="prospect">Prospect</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="cLocation" placeholder="New York, USA"></div>
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" id="cWebsite" placeholder="www.example.com"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Annual Revenue ($)</label><input class="form-input" id="cRevenue" type="number" placeholder="50000"></div>
        <div class="form-group"><label class="form-label">Owner</label>
          <select class="form-select" id="cOwner">
            ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCustomer()"><i class="fas fa-plus"></i> Add Customer</button>`
  });
}

function openEditCustomer(id) {
  const c = DB.getById('customers', id);
  if (!c) return;
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  showModal({
    title: 'Edit Customer', size: 'lg',
    body: `
      <input type="hidden" id="cId" value="${c.id}">
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Company Name</label><input class="form-input" id="cName" value="${escapeHtml(c.name)}"></div>
        <div class="form-group"><label class="form-label required">Contact Person</label><input class="form-input" id="cContact" value="${escapeHtml(c.contactPerson)}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Email</label><input class="form-input" id="cEmail" type="email" value="${escapeHtml(c.email)}"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="cPhone" value="${escapeHtml(c.phone || '')}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Industry</label>
          <select class="form-select" id="cIndustry">
            ${['Technology','SaaS','Finance','Healthcare','Retail','Consulting','Logistics','Education','Manufacturing','Other'].map(i => `<option ${c.industry===i?'selected':''}>${i}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="cStatus">
            <option value="active" ${c.status==='active'?'selected':''}>Active</option>
            <option value="inactive" ${c.status==='inactive'?'selected':''}>Inactive</option>
            <option value="prospect" ${c.status==='prospect'?'selected':''}>Prospect</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="cLocation" value="${escapeHtml(c.location || '')}"></div>
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" id="cWebsite" value="${escapeHtml(c.website || '')}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Annual Revenue ($)</label><input class="form-input" id="cRevenue" type="number" value="${c.revenue || 0}"></div>
        <div class="form-group"><label class="form-label">Owner</label>
          <select class="form-select" id="cOwner">
            ${users.map(u => `<option value="${u.id}" ${c.owner==u.id?'selected':''}>${u.name}</option>`).join('')}
          </select>
        </div>
      </div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCustomer()"><i class="fas fa-save"></i> Save Changes</button>`
  });
}

function saveCustomer() {
  const id = document.getElementById('cId')?.value;
  const name = document.getElementById('cName')?.value.trim();
  const contactPerson = document.getElementById('cContact')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  if (!name || !contactPerson || !email) { showToast('Please fill in required fields', 'error'); return; }

  const isEdit = !!id;
  const customer = isEdit ? { ...DB.getById('customers', parseInt(id)) } : { id: DB.nextId('customers'), createdAt: new Date().toISOString().split('T')[0] };

  customer.name = name;
  customer.contactPerson = contactPerson;
  customer.email = email;
  customer.phone = document.getElementById('cPhone')?.value.trim() || '';
  customer.company = name;
  customer.industry = document.getElementById('cIndustry')?.value || '';
  customer.status = document.getElementById('cStatus')?.value || 'active';
  customer.location = document.getElementById('cLocation')?.value.trim() || '';
  customer.website = document.getElementById('cWebsite')?.value.trim() || '';
  customer.revenue = parseInt(document.getElementById('cRevenue')?.value) || 0;
  customer.owner = parseInt(document.getElementById('cOwner')?.value) || 1;
  customer.lastContact = new Date().toISOString().split('T')[0];
  customer.tags = customer.tags || [];

  DB.save('customers', customer);
  if (!isEdit) logActivity('customer_created', `New customer added: ${customer.name}`, { type: 'customer', id: customer.id, name: customer.name });
  closeModal();
  renderCustomers();
  showToast(isEdit ? 'Customer updated successfully' : 'Customer added successfully', 'success');
  if (!isEdit) runAutomations('customer_created', customer);
}

function deleteCustomer(id) {
  const c = DB.getById('customers', id);
  if (!c) return;
  showConfirm(`Delete customer "${c.name}"? This action cannot be undone.`, () => {
    DB.delete('customers', id);
    renderCustomers();
    showToast('Customer deleted', 'success');
  }, { danger: true, confirmText: 'Delete' });
}

function filterCustomers() {
  customerFilters.search = document.getElementById('searchCustomers')?.value || '';
  customerFilters.status = document.getElementById('filterStatus')?.value || '';
  customerFilters.industry = document.getElementById('filterIndustry')?.value || '';
  customerFilters.owner = document.getElementById('filterOwner')?.value || '';
  renderCustomers();
}

function sortCustomers(col) {
  if (customerSort.col === col) customerSort.dir = customerSort.dir === 'asc' ? 'desc' : 'asc';
  else { customerSort.col = col; customerSort.dir = 'asc'; }
  renderCustomers();
}

function exportCustomers() {
  const customers = DB.getAll('customers');
  const headers = ['Name','Contact Person','Email','Phone','Industry','Location','Status','Revenue','Owner','Created'];
  const rows = customers.map(c => [c.name, c.contactPerson, c.email, c.phone, c.industry, c.location, c.status, c.revenue, getUserName(c.owner), c.createdAt]);
  downloadCSV(headers, rows, 'customers.csv');
}

function downloadCSV(headers, rows, filename) {
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Customer Details Page ── */
function initCustomerDetails() {
  initApp('Customer Details');
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  if (!id) { window.location.href = 'customers.html'; return; }
  const customer = DB.getById('customers', id);
  if (!customer) { window.location.href = 'customers.html'; return; }
  renderCustomerProfile(customer);
  renderCustomerDeals(id);
  renderCustomerTasks(id);
  renderCustomerNotes(id);
  renderCustomerActivities(id);
  document.title = customer.name + ' — NexusCRM';
}

function renderCustomerProfile(c) {
  const el = document.getElementById('customerProfile');
  if (!el) return;
  el.innerHTML = `
    <div class="customer-avatar-lg">${avatarInitials(c.name).toUpperCase()}</div>
    <div class="customer-name">${escapeHtml(c.name)}</div>
    <div class="customer-company">${escapeHtml(c.industry || '')}</div>
    ${statusBadge(c.status)}
    <div class="divider"></div>
    <div class="customer-meta-list">
      <div class="customer-meta-item"><i class="fas fa-user"></i><span>${escapeHtml(c.contactPerson)}</span></div>
      <div class="customer-meta-item"><i class="fas fa-envelope"></i><span>${escapeHtml(c.email)}</span></div>
      <div class="customer-meta-item"><i class="fas fa-phone"></i><span>${escapeHtml(c.phone || '—')}</span></div>
      <div class="customer-meta-item"><i class="fas fa-globe"></i><span>${escapeHtml(c.website || '—')}</span></div>
      <div class="customer-meta-item"><i class="fas fa-map-marker-alt"></i><span>${escapeHtml(c.location || '—')}</span></div>
      <div class="customer-meta-item"><i class="fas fa-dollar-sign"></i><span>${formatCurrency(c.revenue)} revenue</span></div>
      <div class="customer-meta-item"><i class="fas fa-user-tie"></i><span>Owner: ${escapeHtml(getUserName(c.owner))}</span></div>
      <div class="customer-meta-item"><i class="fas fa-calendar-alt"></i><span>Added ${formatDate(c.createdAt)}</span></div>
    </div>
    <div class="divider"></div>
    <button class="btn btn-primary w-full" onclick="openEditCustomer(${c.id}); document.querySelector('.modal').addEventListener('click', ()=> initCustomerDetails(), {once:true})"><i class="fas fa-edit"></i> Edit Customer</button>`;
}

function renderCustomerDeals(customerId) {
  const el = document.getElementById('customerDeals');
  if (!el) return;
  const deals = DB.getAll('deals').filter(d => d.customerId == customerId);
  if (!deals.length) { el.innerHTML = '<div class="empty-state" style="padding:24px"><i class="fas fa-handshake"></i><p>No deals yet</p></div>'; return; }
  el.innerHTML = deals.map(d => `
    <div class="flex items-center justify-between gap-12 mb-3" style="padding:12px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:0.88rem">${escapeHtml(d.name)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Close: ${formatDate(d.expectedCloseDate)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;color:var(--primary)">${formatCurrency(d.value)}</div>
        ${statusBadge(d.stage)}
      </div>
    </div>`).join('');
}

function renderCustomerTasks(customerId) {
  const el = document.getElementById('customerTasks');
  if (!el) return;
  const tasks = DB.getAll('tasks').filter(t => t.linkedTo && t.linkedTo.type === 'customer' && t.linkedTo.id == customerId);
  if (!tasks.length) { el.innerHTML = '<div class="empty-state" style="padding:24px"><i class="fas fa-tasks"></i><p>No tasks yet</p></div>'; return; }
  el.innerHTML = tasks.map(t => `
    <div class="flex items-center gap-3 mb-3">
      <input type="checkbox" ${t.status === 'completed' ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--primary)" onchange="toggleTask(${t.id}, this.checked)">
      <div style="flex:1">
        <div style="font-size:0.85rem;font-weight:${t.status === 'completed' ? '400' : '600'};text-decoration:${t.status === 'completed' ? 'line-through' : 'none'};color:${t.status === 'completed' ? 'var(--text-muted)' : 'var(--text)'}">${escapeHtml(t.title)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Due ${formatDate(t.dueDate)}</div>
      </div>
      ${priorityBadge(t.priority)}
    </div>`).join('');
}

function toggleTask(id, completed) {
  const task = DB.getById('tasks', id);
  if (!task) return;
  task.status = completed ? 'completed' : 'pending';
  task.completedAt = completed ? new Date().toISOString() : null;
  DB.save('tasks', task);
  if (completed) logActivity('task_completed', `Task completed: ${task.title}`, { type: 'task', id: task.id, name: task.title });
}

function renderCustomerNotes(customerId) {
  const el = document.getElementById('customerNotes');
  if (!el) return;
  const notes = DB.getAll('notes').filter(n => n.customerId == customerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const addNoteForm = `
    <div style="margin-bottom:16px">
      <textarea class="form-textarea" id="newNoteText" placeholder="Add a note..." style="min-height:72px"></textarea>
      <button class="btn btn-primary btn-sm mt-2" onclick="addNote(${customerId})"><i class="fas fa-plus"></i> Add Note</button>
    </div>`;

  if (!notes.length) { el.innerHTML = addNoteForm + '<div style="text-align:center;color:var(--text-muted);font-size:0.85rem">No notes yet</div>'; return; }
  el.innerHTML = addNoteForm + notes.map(n => `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:10px">
      <div class="flex items-center justify-between mb-2">
        <div style="font-size:0.78rem;font-weight:600;color:var(--primary)">${escapeHtml(n.createdByName)}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">${formatDate(n.createdAt, true)}</div>
      </div>
      <div style="font-size:0.85rem;color:var(--text-secondary)">${escapeHtml(n.content)}</div>
    </div>`).join('');
}

function addNote(customerId) {
  const text = document.getElementById('newNoteText')?.value.trim();
  if (!text) return showToast('Please enter a note', 'error');
  const user = Auth.getCurrentUser();
  DB.save('notes', {
    id: DB.nextId('notes'), customerId,
    content: text,
    createdBy: user.id, createdByName: user.name,
    createdAt: new Date().toISOString()
  });
  logActivity('note', `Note added for customer`, { type: 'customer', id: customerId });
  renderCustomerNotes(customerId);
  showToast('Note added', 'success');
}

function renderCustomerActivities(customerId) {
  const el = document.getElementById('customerActivities');
  if (!el) return;
  const activities = DB.getAll('activities')
    .filter(a => a.relatedTo && a.relatedTo.type === 'customer' && a.relatedTo.id == customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  if (!activities.length) { el.innerHTML = '<div class="empty-state" style="padding:24px"><i class="fas fa-stream"></i><p>No activities yet</p></div>'; return; }
  const typeColors = { call: 'primary', meeting: 'success', email: 'info', note: 'warning', status_update: 'secondary', task_completed: 'success' };
  el.innerHTML = `<div class="timeline">` + activities.map(a => `
    <div class="timeline-item">
      <div class="timeline-icon-wrap">
        <div class="timeline-icon" style="background:var(--${typeColors[a.type]||'info'}-bg);color:var(--${typeColors[a.type]||'info'})"><i class="fas ${a.icon||'fa-circle'}"></i></div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-content">
        <div class="timeline-header"><span class="timeline-title">${escapeHtml(a.createdByName)}</span><span class="timeline-time">${formatDateRelative(a.createdAt)}</span></div>
        <div class="timeline-desc">${escapeHtml(a.description)}</div>
      </div>
    </div>`).join('') + `</div>`;
}
