/* ============================================================
   NEXUS CRM — LEADS
   ============================================================ */

let leadFilters = { search: '', status: '', source: '', owner: '' };

function initLeads() {
  initApp('Leads');
  renderLeads();
  renderLeadStats();
}

function renderLeadStats() {
  const leads = DB.getAll('leads');
  const byStatus = {};
  leads.forEach(l => byStatus[l.status] = (byStatus[l.status] || 0) + 1);
  const el = document.getElementById('leadStats');
  if (!el) return;
  const statuses = [
    { key: 'new', label: 'New', icon: 'fa-star', color: 'info' },
    { key: 'contacted', label: 'Contacted', icon: 'fa-phone', color: 'accent' },
    { key: 'qualified', label: 'Qualified', icon: 'fa-check-circle', color: 'primary' },
    { key: 'proposal', label: 'Proposal', icon: 'fa-file-alt', color: 'secondary' },
    { key: 'converted', label: 'Converted', icon: 'fa-user-check', color: 'success' },
    { key: 'lost', label: 'Lost', icon: 'fa-times-circle', color: 'danger' }
  ];
  el.innerHTML = statuses.map(s => `
    <div class="stat-card">
      <div class="stat-icon ${s.color}"><i class="fas ${s.icon}"></i></div>
      <div class="stat-body">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${byStatus[s.key] || 0}</div>
      </div>
    </div>`).join('');
}

function renderLeads() {
  const container = document.getElementById('leadTableBody');
  if (!container) return;
  let leads = DB.getAll('leads');

  if (leadFilters.search) {
    const q = leadFilters.search.toLowerCase();
    leads = leads.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
  }
  if (leadFilters.status) leads = leads.filter(l => l.status === leadFilters.status);
  if (leadFilters.source) leads = leads.filter(l => l.source === leadFilters.source);
  if (leadFilters.owner) leads = leads.filter(l => l.owner == leadFilters.owner);

  leads.sort((a, b) => b.score - a.score);
  document.getElementById('leadCount').textContent = leads.length + ' leads';

  if (!leads.length) {
    container.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-user-plus"></i><h3>No leads found</h3><p>Add a new lead or adjust your filters</p></div></td></tr>`;
    return;
  }

  container.innerHTML = leads.map(l => {
    const scoreColor = l.score >= 80 ? 'danger' : l.score >= 60 ? 'warning' : 'info';
    return `
    <tr>
      <td>
        <div class="flex items-center gap-2">
          ${avatarHtml(l.name, 'sm')}
          <div>
            <div style="font-weight:600">${escapeHtml(l.name)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(l.company)}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:0.83rem">${escapeHtml(l.email)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(l.phone || '')}</div>
      </td>
      <td><span class="badge badge-gray">${escapeHtml(l.source)}</span></td>
      <td>${statusBadge(l.status)}</td>
      <td>
        <div class="lead-score">
          <span style="font-size:0.85rem;font-weight:700;color:var(--${scoreColor})">${l.score}</span>
          <div class="lead-score-bar"><div class="lead-score-fill score-${scoreColor==='danger'?'hot':scoreColor==='warning'?'warm':'cold'}" style="width:${l.score}%"></div></div>
        </div>
      </td>
      <td>${escapeHtml(getUserName(l.owner))}</td>
      <td>${formatDate(l.createdAt)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon-sm" onclick="openEditLead(${l.id})" title="Edit"><i class="fas fa-edit"></i></button>
          ${l.status !== 'converted' && l.status !== 'lost' ? `<button class="btn btn-ghost btn-icon-sm" onclick="convertLead(${l.id})" title="Convert to Customer" style="color:var(--success)"><i class="fas fa-user-check"></i></button>` : ''}
          <button class="btn btn-ghost btn-icon-sm" onclick="deleteLead(${l.id})" title="Delete" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddLead() {
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  showModal({
    title: 'Add New Lead', size: 'lg',
    body: `
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Full Name</label><input class="form-input" id="lName" placeholder="John Doe"></div>
        <div class="form-group"><label class="form-label">Company</label><input class="form-input" id="lCompany" placeholder="Tech Co"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Email</label><input class="form-input" id="lEmail" type="email" placeholder="john@techco.com"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="lPhone" placeholder="+1-555-0000"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Source</label>
          <select class="form-select" id="lSource">
            <option>Website</option><option>LinkedIn</option><option>Referral</option><option>Cold Call</option><option>Event</option><option>Email Campaign</option><option>Social Media</option><option>Other</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="lStatus">
            <option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lead Score (0-100)</label><input class="form-input" id="lScore" type="number" min="0" max="100" value="50"></div>
        <div class="form-group"><label class="form-label">Assign To</label>
          <select class="form-select" id="lOwner">${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="lNotes" placeholder="Additional information..." style="min-height:72px"></textarea></div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveLead()"><i class="fas fa-plus"></i> Add Lead</button>`
  });
}

function openEditLead(id) {
  const l = DB.getById('leads', id);
  if (!l) return;
  const users = DB.getAll('users').filter(u => u.role !== 'viewer');
  showModal({
    title: 'Edit Lead', size: 'lg',
    body: `
      <input type="hidden" id="lId" value="${l.id}">
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Full Name</label><input class="form-input" id="lName" value="${escapeHtml(l.name)}"></div>
        <div class="form-group"><label class="form-label">Company</label><input class="form-input" id="lCompany" value="${escapeHtml(l.company)}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label required">Email</label><input class="form-input" id="lEmail" type="email" value="${escapeHtml(l.email)}"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="lPhone" value="${escapeHtml(l.phone || '')}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Source</label>
          <select class="form-select" id="lSource">
            ${['Website','LinkedIn','Referral','Cold Call','Event','Email Campaign','Social Media','Other'].map(s => `<option ${l.source===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="lStatus">
            ${['new','contacted','qualified','proposal','converted','lost'].map(s => `<option value="${s}" ${l.status===s?'selected':''}>${capitalize(s)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lead Score (0-100)</label><input class="form-input" id="lScore" type="number" min="0" max="100" value="${l.score}"></div>
        <div class="form-group"><label class="form-label">Assign To</label>
          <select class="form-select" id="lOwner">${users.map(u => `<option value="${u.id}" ${l.owner==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="lNotes" style="min-height:72px">${escapeHtml(l.notes || '')}</textarea></div>`,
    footer: `<button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveLead()"><i class="fas fa-save"></i> Save Changes</button>`
  });
}

function saveLead() {
  const id = document.getElementById('lId')?.value;
  const name = document.getElementById('lName')?.value.trim();
  const email = document.getElementById('lEmail')?.value.trim();
  if (!name || !email) { showToast('Name and email are required', 'error'); return; }

  const isEdit = !!id;
  const prevLead = isEdit ? DB.getById('leads', parseInt(id)) : null;
  const lead = isEdit ? { ...prevLead } : { id: DB.nextId('leads'), createdAt: new Date().toISOString().split('T')[0], convertedToCustomer: null };

  lead.name = name;
  lead.email = email;
  lead.company = document.getElementById('lCompany')?.value.trim() || '';
  lead.phone = document.getElementById('lPhone')?.value.trim() || '';
  lead.source = document.getElementById('lSource')?.value || 'Website';
  lead.status = document.getElementById('lStatus')?.value || 'new';
  lead.score = parseInt(document.getElementById('lScore')?.value) || 50;
  lead.owner = parseInt(document.getElementById('lOwner')?.value) || 1;
  lead.notes = document.getElementById('lNotes')?.value.trim() || '';

  const statusChanged = prevLead && prevLead.status !== lead.status;
  DB.save('leads', lead);

  if (!isEdit) {
    logActivity('lead_created', `New lead added: ${lead.name} from ${lead.company}`, { type: 'lead', id: lead.id, name: lead.name });
    runAutomations('lead_status', { ...lead, linkedTo: { type: 'lead', id: lead.id } });
  } else if (statusChanged) {
    logActivity('status_update', `Lead ${lead.name} status changed to ${lead.status}`, { type: 'lead', id: lead.id, name: lead.name });
    runAutomations('lead_status', { ...lead, linkedTo: { type: 'lead', id: lead.id } });
  }

  closeModal();
  renderLeads();
  renderLeadStats();
  showToast(isEdit ? 'Lead updated' : 'Lead added', 'success');
}

function deleteLead(id) {
  const l = DB.getById('leads', id);
  if (!l) return;
  showConfirm(`Delete lead "${l.name}"?`, () => {
    DB.delete('leads', id);
    renderLeads();
    renderLeadStats();
    showToast('Lead deleted', 'success');
  }, { danger: true, confirmText: 'Delete' });
}

function convertLead(id) {
  const l = DB.getById('leads', id);
  if (!l) return;
  showConfirm(`Convert "${l.name}" to a customer? This will create a new customer record.`, () => {
    const customer = {
      id: DB.nextId('customers'),
      name: l.company || l.name,
      contactPerson: l.name,
      email: l.email,
      phone: l.phone || '',
      company: l.company || l.name,
      industry: '',
      location: '',
      website: '',
      status: 'active',
      owner: l.owner,
      revenue: 0,
      tags: ['converted'],
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0]
    };
    DB.save('customers', customer);
    l.status = 'converted';
    l.convertedToCustomer = customer.id;
    DB.save('leads', l);
    logActivity('customer_created', `Lead ${l.name} converted to customer`, { type: 'customer', id: customer.id, name: customer.name });
    renderLeads();
    renderLeadStats();
    showToast(`${l.name} converted to customer!`, 'success');
  }, { confirmText: 'Convert' });
}

function filterLeads() {
  leadFilters.search = document.getElementById('searchLeads')?.value || '';
  leadFilters.status = document.getElementById('filterLeadStatus')?.value || '';
  leadFilters.source = document.getElementById('filterLeadSource')?.value || '';
  renderLeads();
}

function exportLeads() {
  const leads = DB.getAll('leads');
  const headers = ['Name','Company','Email','Phone','Source','Status','Score','Owner','Created'];
  const rows = leads.map(l => [l.name, l.company, l.email, l.phone, l.source, l.status, l.score, getUserName(l.owner), l.createdAt]);
  downloadCSV(headers, rows, 'leads.csv');
}
