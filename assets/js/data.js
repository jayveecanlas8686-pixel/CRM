/* ============================================================
   NEXUS CRM — DEMO DATA & DATA LAYER
   ============================================================ */

const DEMO_DATA = {
  users: [
    { id: 1, name: 'Alex Morgan', email: 'admin@example.com', password: 'password123', role: 'admin', avatar: null, department: 'Management', phone: '+1-555-0001', status: 'active', createdAt: '2024-01-01', lastLogin: '2026-06-09' },
    { id: 2, name: 'Sarah Chen', email: 'manager@example.com', password: 'password123', role: 'manager', avatar: null, department: 'Sales', phone: '+1-555-0002', status: 'active', createdAt: '2024-01-10', lastLogin: '2026-06-08' },
    { id: 3, name: 'James Wilson', email: 'agent@example.com', password: 'password123', role: 'agent', avatar: null, department: 'Sales', phone: '+1-555-0003', status: 'active', createdAt: '2024-01-15', lastLogin: '2026-06-07' },
    { id: 4, name: 'Maria Garcia', email: 'maria@example.com', password: 'password123', role: 'agent', avatar: null, department: 'Sales', phone: '+1-555-0004', status: 'active', createdAt: '2024-02-01', lastLogin: '2026-06-06' },
    { id: 5, name: 'David Park', email: 'david@example.com', password: 'password123', role: 'viewer', avatar: null, department: 'Marketing', phone: '+1-555-0005', status: 'inactive', createdAt: '2024-03-01', lastLogin: '2026-05-20' }
  ],

  customers: [
    { id: 1, name: 'Acme Corporation', contactPerson: 'John Smith', email: 'john@acme.com', phone: '+1-555-1001', company: 'Acme Corporation', website: 'www.acme.com', industry: 'Technology', location: 'New York, USA', status: 'active', owner: 1, revenue: 120000, tags: ['enterprise', 'tech'], createdAt: '2024-01-20', lastContact: '2026-06-01' },
    { id: 2, name: 'Bright Solutions', contactPerson: 'Emily Johnson', email: 'emily@brightsol.com', phone: '+1-555-1002', company: 'Bright Solutions', website: 'www.brightsol.com', industry: 'Consulting', location: 'Chicago, USA', status: 'active', owner: 2, revenue: 85000, tags: ['consulting'], createdAt: '2024-02-05', lastContact: '2026-05-28' },
    { id: 3, name: 'CloudPeak Inc', contactPerson: 'Robert Chen', email: 'robert@cloudpeak.io', phone: '+1-555-1003', company: 'CloudPeak Inc', website: 'www.cloudpeak.io', industry: 'SaaS', location: 'San Francisco, USA', status: 'active', owner: 3, revenue: 200000, tags: ['saas', 'enterprise'], createdAt: '2024-02-20', lastContact: '2026-06-05' },
    { id: 4, name: 'Delta Retail Group', contactPerson: 'Lisa Brown', email: 'lisa@deltaretail.com', phone: '+1-555-1004', company: 'Delta Retail Group', website: 'www.deltaretail.com', industry: 'Retail', location: 'Dallas, USA', status: 'inactive', owner: 2, revenue: 45000, tags: ['retail'], createdAt: '2024-03-10', lastContact: '2026-04-15' },
    { id: 5, name: 'EcoVerde Ltd', contactPerson: 'Carlos Mendez', email: 'carlos@ecoverde.com', phone: '+1-555-1005', company: 'EcoVerde Ltd', website: 'www.ecoverde.com', industry: 'Green Tech', location: 'Austin, USA', status: 'active', owner: 3, revenue: 67000, tags: ['greentech', 'startup'], createdAt: '2024-03-25', lastContact: '2026-06-03' },
    { id: 6, name: 'FinEdge Capital', contactPerson: 'Rachel Kim', email: 'rachel@finedge.com', phone: '+1-555-1006', company: 'FinEdge Capital', website: 'www.finedge.com', industry: 'Finance', location: 'Boston, USA', status: 'active', owner: 1, revenue: 310000, tags: ['finance', 'enterprise'], createdAt: '2024-04-01', lastContact: '2026-06-07' },
    { id: 7, name: 'GlobalMed Systems', contactPerson: 'Tom Williams', email: 'tom@globalmed.com', phone: '+1-555-1007', company: 'GlobalMed Systems', website: 'www.globalmed.com', industry: 'Healthcare', location: 'Seattle, USA', status: 'active', owner: 4, revenue: 155000, tags: ['healthcare'], createdAt: '2024-04-15', lastContact: '2026-05-30' },
    { id: 8, name: 'Horizon Logistics', contactPerson: 'Anna Lee', email: 'anna@horizonlog.com', phone: '+1-555-1008', company: 'Horizon Logistics', website: 'www.horizonlog.com', industry: 'Logistics', location: 'Miami, USA', status: 'prospect', owner: 3, revenue: 0, tags: ['logistics', 'prospect'], createdAt: '2024-05-01', lastContact: '2026-06-02' }
  ],

  leads: [
    { id: 1, name: 'Michael Torres', email: 'michael@techventures.io', phone: '+1-555-2001', company: 'Tech Ventures', source: 'Website', status: 'new', score: 45, owner: 3, notes: 'Interested in enterprise plan', createdAt: '2026-05-15', convertedToCustomer: null },
    { id: 2, name: 'Jennifer Walsh', email: 'j.walsh@mediapro.com', phone: '+1-555-2002', company: 'Media Pro', source: 'LinkedIn', status: 'contacted', score: 70, owner: 2, notes: 'Scheduled a demo call', createdAt: '2026-05-18', convertedToCustomer: null },
    { id: 3, name: 'Kevin Zhang', email: 'kzhang@nexacloud.com', phone: '+1-555-2003', company: 'NexaCloud', source: 'Referral', status: 'qualified', score: 88, owner: 1, notes: 'High budget, decision maker', createdAt: '2026-05-20', convertedToCustomer: null },
    { id: 4, name: 'Sophia Patel', email: 'sophia@growthco.in', phone: '+1-555-2004', company: 'GrowthCo', source: 'Cold Call', status: 'proposal', score: 75, owner: 3, notes: 'Sent proposal doc', createdAt: '2026-05-22', convertedToCustomer: null },
    { id: 5, name: 'Brian Foster', email: 'bfoster@innovatech.com', phone: '+1-555-2005', company: 'InnovaTech', source: 'Event', status: 'new', score: 30, owner: 4, notes: 'Met at SaaS summit', createdAt: '2026-05-25', convertedToCustomer: null },
    { id: 6, name: 'Christine Ho', email: 'cho@retailnext.com', phone: '+1-555-2006', company: 'RetailNext', source: 'Website', status: 'converted', score: 90, owner: 2, notes: 'Converted to customer', createdAt: '2026-05-10', convertedToCustomer: 4 },
    { id: 7, name: 'Derek Owens', email: 'd.owens@blueline.io', phone: '+1-555-2007', company: 'BlueLine', source: 'LinkedIn', status: 'lost', score: 20, owner: 3, notes: 'No response after 3 follow-ups', createdAt: '2026-04-20', convertedToCustomer: null },
    { id: 8, name: 'Laura Simmons', email: 'lsimmons@startwise.co', phone: '+1-555-2008', company: 'StartWise', source: 'Referral', status: 'contacted', score: 60, owner: 1, notes: 'Referred by Acme Corp', createdAt: '2026-06-01', convertedToCustomer: null },
    { id: 9, name: 'Nathan Brooks', email: 'nbrooks@pinnacle.com', phone: '+1-555-2009', company: 'Pinnacle Inc', source: 'Email Campaign', status: 'qualified', score: 82, owner: 4, notes: 'Budget confirmed $50k/yr', createdAt: '2026-06-03', convertedToCustomer: null }
  ],

  deals: [
    { id: 1, name: 'Enterprise License - Acme', value: 48000, customerId: 1, customerName: 'Acme Corporation', stage: 'negotiation', probability: 75, expectedCloseDate: '2026-07-15', owner: 1, notes: 'Discussing annual commitment', createdAt: '2026-04-10' },
    { id: 2, name: 'SaaS Subscription - CloudPeak', value: 24000, customerId: 3, customerName: 'CloudPeak Inc', stage: 'proposal', probability: 55, expectedCloseDate: '2026-07-01', owner: 3, notes: 'Sent proposal, awaiting feedback', createdAt: '2026-05-01' },
    { id: 3, name: 'Consulting Retainer - Bright', value: 18000, customerId: 2, customerName: 'Bright Solutions', stage: 'qualification', probability: 40, expectedCloseDate: '2026-08-01', owner: 2, notes: 'Initial meeting done', createdAt: '2026-05-15' },
    { id: 4, name: 'Analytics Package - FinEdge', value: 72000, customerId: 6, customerName: 'FinEdge Capital', stage: 'won', probability: 100, expectedCloseDate: '2026-05-30', owner: 1, notes: 'Closed successfully!', createdAt: '2026-03-20' },
    { id: 5, name: 'API Integration - EcoVerde', value: 12000, customerId: 5, customerName: 'EcoVerde Ltd', stage: 'prospecting', probability: 20, expectedCloseDate: '2026-09-01', owner: 3, notes: 'Exploring requirements', createdAt: '2026-06-01' },
    { id: 6, name: 'Healthcare Suite - GlobalMed', value: 95000, customerId: 7, customerName: 'GlobalMed Systems', stage: 'negotiation', probability: 80, expectedCloseDate: '2026-07-20', owner: 4, notes: 'Legal review in progress', createdAt: '2026-04-25' },
    { id: 7, name: 'SMB Package - Delta Retail', value: 8500, customerId: 4, customerName: 'Delta Retail Group', stage: 'lost', probability: 0, expectedCloseDate: '2026-04-30', owner: 2, notes: 'Went with competitor', createdAt: '2026-03-10' },
    { id: 8, name: 'Logistics Tracking - Horizon', value: 35000, customerId: 8, customerName: 'Horizon Logistics', stage: 'qualification', probability: 35, expectedCloseDate: '2026-08-15', owner: 3, notes: 'Need to meet operations team', createdAt: '2026-06-02' }
  ],

  tasks: [
    { id: 1, title: 'Follow-up call with Acme Corp', description: 'Discuss Q3 renewal terms and pricing', assignedTo: 1, dueDate: '2026-06-10', priority: 'high', status: 'pending', linkedTo: { type: 'customer', id: 1 }, createdAt: '2026-06-05', completedAt: null },
    { id: 2, title: 'Send proposal to CloudPeak', description: 'Finalize SaaS subscription proposal doc', assignedTo: 3, dueDate: '2026-06-11', priority: 'high', status: 'in-progress', linkedTo: { type: 'deal', id: 2 }, createdAt: '2026-06-04', completedAt: null },
    { id: 3, title: 'Lead qualification call - Kevin Zhang', description: 'Assess budget and timeline', assignedTo: 1, dueDate: '2026-06-09', priority: 'urgent', status: 'pending', linkedTo: { type: 'lead', id: 3 }, createdAt: '2026-06-03', completedAt: null },
    { id: 4, title: 'Prepare GlobalMed contract draft', description: 'Work with legal on contract terms', assignedTo: 4, dueDate: '2026-06-15', priority: 'medium', status: 'in-progress', linkedTo: { type: 'deal', id: 6 }, createdAt: '2026-06-02', completedAt: null },
    { id: 5, title: 'Onboarding call - FinEdge Capital', description: 'Schedule kickoff meeting for new implementation', assignedTo: 2, dueDate: '2026-06-07', priority: 'high', status: 'completed', linkedTo: { type: 'deal', id: 4 }, createdAt: '2026-05-30', completedAt: '2026-06-07' },
    { id: 6, title: 'Update CRM records - Bright Solutions', description: 'Enter meeting notes from last call', assignedTo: 2, dueDate: '2026-06-05', priority: 'low', status: 'completed', linkedTo: { type: 'customer', id: 2 }, createdAt: '2026-06-04', completedAt: '2026-06-05' },
    { id: 7, title: 'Demo for Sophia Patel - GrowthCo', description: '30-min product walkthrough', assignedTo: 3, dueDate: '2026-06-13', priority: 'high', status: 'pending', linkedTo: { type: 'lead', id: 4 }, createdAt: '2026-06-06', completedAt: null },
    { id: 8, title: 'Quarterly review report', description: 'Compile Q2 sales performance data', assignedTo: 2, dueDate: '2026-06-30', priority: 'medium', status: 'pending', linkedTo: null, createdAt: '2026-06-01', completedAt: null },
    { id: 9, title: 'Check in with EcoVerde', description: 'Monthly touchpoint call', assignedTo: 3, dueDate: '2026-06-03', priority: 'low', status: 'pending', linkedTo: { type: 'customer', id: 5 }, createdAt: '2026-05-28', completedAt: null }
  ],

  activities: [
    { id: 1, type: 'call', icon: 'fa-phone', description: 'Called John Smith at Acme Corp — discussed Q3 enterprise renewal and pricing options', relatedTo: { type: 'customer', id: 1, name: 'Acme Corporation' }, createdBy: 1, createdByName: 'Alex Morgan', createdAt: '2026-06-09T10:30:00Z' },
    { id: 2, type: 'email', icon: 'fa-envelope', description: 'Sent proposal document to CloudPeak Inc for SaaS subscription deal', relatedTo: { type: 'deal', id: 2, name: 'SaaS Subscription - CloudPeak' }, createdBy: 3, createdByName: 'James Wilson', createdAt: '2026-06-08T14:15:00Z' },
    { id: 3, type: 'meeting', icon: 'fa-users', description: 'Strategy meeting with FinEdge Capital team — onboarding kickoff completed successfully', relatedTo: { type: 'customer', id: 6, name: 'FinEdge Capital' }, createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-07T11:00:00Z' },
    { id: 4, type: 'note', icon: 'fa-sticky-note', description: 'Lead Kevin Zhang confirmed $80k annual budget — strong fit for enterprise tier', relatedTo: { type: 'lead', id: 3, name: 'Kevin Zhang' }, createdBy: 1, createdByName: 'Alex Morgan', createdAt: '2026-06-06T16:45:00Z' },
    { id: 5, type: 'status_update', icon: 'fa-arrow-right', description: 'Deal "Enterprise License - Acme" moved from Proposal to Negotiation stage', relatedTo: { type: 'deal', id: 1, name: 'Enterprise License - Acme' }, createdBy: 1, createdByName: 'Alex Morgan', createdAt: '2026-06-05T09:20:00Z' },
    { id: 6, type: 'task_completed', icon: 'fa-check-circle', description: 'Task completed: Onboarding call with FinEdge Capital — all systems go', relatedTo: { type: 'task', id: 5, name: 'Onboarding call - FinEdge Capital' }, createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-07T15:30:00Z' },
    { id: 7, type: 'call', icon: 'fa-phone', description: 'Discovery call with Jennifer Walsh at Media Pro — needs demo scheduled for next week', relatedTo: { type: 'lead', id: 2, name: 'Jennifer Walsh' }, createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-04T13:00:00Z' },
    { id: 8, type: 'meeting', icon: 'fa-users', description: 'Internal review of GlobalMed contract terms with legal department', relatedTo: { type: 'deal', id: 6, name: 'Healthcare Suite - GlobalMed' }, createdBy: 4, createdByName: 'Maria Garcia', createdAt: '2026-06-03T10:00:00Z' },
    { id: 9, type: 'email', icon: 'fa-envelope', description: 'Welcome email sent to new customer Horizon Logistics with account setup instructions', relatedTo: { type: 'customer', id: 8, name: 'Horizon Logistics' }, createdBy: 3, createdByName: 'James Wilson', createdAt: '2026-06-02T11:30:00Z' },
    { id: 10, type: 'note', icon: 'fa-sticky-note', description: 'Bright Solutions requesting extended payment terms — flagged for manager review', relatedTo: { type: 'customer', id: 2, name: 'Bright Solutions' }, createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-01T14:00:00Z' }
  ],

  emails: [
    { id: 1, folder: 'sent', from: 'admin@example.com', fromName: 'Alex Morgan', to: 'john@acme.com', toName: 'John Smith', subject: 'Q3 Enterprise Renewal Proposal', body: 'Dear John,\n\nI hope this message finds you well. Following our call earlier today, I wanted to formally present our Q3 Enterprise Renewal Proposal for Acme Corporation.\n\nKey highlights of the proposal:\n• 20% discount for annual commitment\n• Priority support package included\n• Custom API integration at no additional cost\n\nPlease review the attached details and let me know if you have any questions. I am available for a call this week to discuss further.\n\nBest regards,\nAlex Morgan\nNexus CRM', templateId: null, status: 'sent', sentAt: '2026-06-09T10:45:00Z', customerId: 1 },
    { id: 2, folder: 'sent', from: 'manager@example.com', fromName: 'Sarah Chen', to: 'emily@brightsol.com', toName: 'Emily Johnson', subject: 'Consulting Retainer Package Details', body: 'Hi Emily,\n\nThank you for your time on our recent call. As discussed, I am sharing the details of our consulting retainer options.\n\nWe offer three tiers:\n1. Essential: 10 hrs/month at $1,500/month\n2. Professional: 25 hrs/month at $3,200/month\n3. Enterprise: Unlimited at $6,000/month\n\nAll tiers include dedicated account management and monthly reporting.\n\nLooking forward to your thoughts!\n\nSarah Chen\nSales Manager', templateId: null, status: 'sent', sentAt: '2026-06-08T09:30:00Z', customerId: 2 },
    { id: 3, folder: 'inbox', from: 'robert@cloudpeak.io', fromName: 'Robert Chen', to: 'agent@example.com', toName: 'James Wilson', subject: 'Re: SaaS Subscription Proposal', body: 'Hi James,\n\nThanks for sending over the proposal. We have reviewed it internally and have a few questions:\n\n1. Can we negotiate on the number of seats?\n2. What are the data migration options?\n3. Is there a sandbox environment for testing?\n\nLooking forward to your response.\n\nBest,\nRobert', templateId: null, status: 'received', sentAt: '2026-06-08T16:20:00Z', customerId: 3 },
    { id: 4, folder: 'inbox', from: 'rachel@finedge.com', fromName: 'Rachel Kim', to: 'admin@example.com', toName: 'Alex Morgan', subject: 'Onboarding Next Steps', body: 'Hi Alex,\n\nGreat meeting today! The team is excited to get started.\n\nFor our next steps, we will need:\n• IT access setup for 15 users\n• Integration with our Salesforce instance\n• Training sessions scheduled for next week\n\nPlease send over the implementation timeline at your earliest convenience.\n\nThank you,\nRachel Kim\nFinEdge Capital', templateId: null, status: 'received', sentAt: '2026-06-07T17:00:00Z', customerId: 6 },
    { id: 5, folder: 'sent', from: 'agent@example.com', fromName: 'James Wilson', to: 'carlos@ecoverde.com', toName: 'Carlos Mendez', subject: 'Follow-up: Monthly Check-in', body: 'Hi Carlos,\n\nJust checking in to see how things are going on your end. I wanted to make sure everything is running smoothly with your current setup.\n\nAlso, I wanted to share some updates about our new API integration features that could be a great fit for EcoVerde.\n\nAre you available for a 20-minute call this week?\n\nBest,\nJames Wilson', templateId: null, status: 'sent', sentAt: '2026-06-06T11:00:00Z', customerId: 5 }
  ],

  automations: [
    { id: 1, name: 'Qualified Lead Follow-up', trigger: { type: 'lead_status', value: 'qualified' }, action: { type: 'create_task', template: 'Schedule discovery call with {{lead_name}}' }, enabled: true, lastRun: '2026-06-09T08:00:00Z', runs: 12, createdAt: '2024-01-15' },
    { id: 2, name: 'Proposal Stage Reminder', trigger: { type: 'deal_stage', value: 'proposal' }, action: { type: 'create_task', template: 'Follow up on proposal sent to {{customer_name}}' }, enabled: true, lastRun: '2026-06-08T08:00:00Z', runs: 8, createdAt: '2024-01-20' },
    { id: 3, name: 'Overdue Task Alert', trigger: { type: 'task_overdue', value: null }, action: { type: 'update_priority', template: 'Mark as urgent' }, enabled: true, lastRun: '2026-06-09T06:00:00Z', runs: 25, createdAt: '2024-02-01' },
    { id: 4, name: 'Deal Won Celebration', trigger: { type: 'deal_stage', value: 'won' }, action: { type: 'log_activity', template: 'Deal won! Log success note for {{deal_name}}' }, enabled: true, lastRun: '2026-05-30T15:00:00Z', runs: 5, createdAt: '2024-02-10' },
    { id: 5, name: 'New Customer Welcome', trigger: { type: 'customer_created', value: null }, action: { type: 'send_email', template: 'Send welcome email to {{customer_email}}' }, enabled: false, lastRun: null, runs: 0, createdAt: '2024-03-01' },
    { id: 6, name: 'Lead Inactivity Check', trigger: { type: 'lead_inactive', value: '14' }, action: { type: 'create_task', template: 'Re-engage lead {{lead_name}} after 14 days of inactivity' }, enabled: true, lastRun: '2026-06-05T08:00:00Z', runs: 18, createdAt: '2024-03-15' }
  ],

  notes: [
    { id: 1, customerId: 1, content: 'Discussed Q3 pricing and enterprise add-ons. John is interested in data analytics module. Follow up next week.', createdBy: 1, createdByName: 'Alex Morgan', createdAt: '2026-06-09T10:30:00Z' },
    { id: 2, customerId: 3, content: 'Robert wants custom API access. Needs confirmation from their CTO before proceeding with proposal.', createdBy: 3, createdByName: 'James Wilson', createdAt: '2026-06-06T14:00:00Z' },
    { id: 3, customerId: 6, content: 'Implementation kickoff scheduled for June 15. IT team contact is Marcus at it@finedge.com.', createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-07T12:00:00Z' },
    { id: 4, customerId: 2, content: 'Emily mentioned they are evaluating 2 other vendors. Need to differentiate our offering before end of month.', createdBy: 2, createdByName: 'Sarah Chen', createdAt: '2026-06-05T09:00:00Z' },
    { id: 5, customerId: 7, content: 'Contract under legal review. Tom confirmed budget is approved at $95k. Expected sign by June 20.', createdBy: 4, createdByName: 'Maria Garcia', createdAt: '2026-06-03T11:00:00Z' }
  ],

  helpInquiries: [
    { id: 1, name: 'Test User', email: 'test@example.com', subject: 'How to export data', message: 'Can you explain how to export customer data to CSV?', status: 'open', createdAt: '2026-06-01' }
  ],

  pipelineStages: [
    { id: 'prospecting', name: 'Prospecting', probability: 10, order: 1, color: '#94a3b8' },
    { id: 'qualification', name: 'Qualification', probability: 25, order: 2, color: '#60a5fa' },
    { id: 'proposal', name: 'Proposal', probability: 50, order: 3, color: '#a78bfa' },
    { id: 'negotiation', name: 'Negotiation', probability: 75, order: 4, color: '#f59e0b' },
    { id: 'won', name: 'Won', probability: 100, order: 5, color: '#22c55e' },
    { id: 'lost', name: 'Lost', probability: 0, order: 6, color: '#ef4444' }
  ],

  settings: {
    companyName: 'Nexus CRM',
    companyEmail: 'hello@nexuscrm.io',
    companyPhone: '+1-800-NEXUS',
    companyAddress: '123 Tech Street, San Francisco, CA 94102',
    primaryColor: '#6366f1',
    theme: 'light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    notifications: { taskReminders: true, dealUpdates: true, leadAlerts: true, emailNotifs: false }
  }
};

/* ── Data Access Layer ── */
const DB = {
  get(key) {
    try { const d = localStorage.getItem('crm_' + key); return d ? JSON.parse(d) : null; } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem('crm_' + key, JSON.stringify(value)); return true; } catch { return false; }
  },
  getAll(key) { return this.get(key) || []; },
  getById(key, id) { return this.getAll(key).find(i => i.id == id) || null; },
  save(key, item) {
    const arr = this.getAll(key);
    const idx = arr.findIndex(i => i.id == item.id);
    if (idx >= 0) { arr[idx] = item; } else { arr.push(item); }
    return this.set(key, arr);
  },
  delete(key, id) {
    const arr = this.getAll(key).filter(i => i.id != id);
    return this.set(key, arr);
  },
  nextId(key) {
    const arr = this.getAll(key);
    return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
  }
};

function initData() {
  if (!localStorage.getItem('crm_initialized')) {
    resetData();
    localStorage.setItem('crm_initialized', '1');
  }
  const s = DB.get('settings');
  if (s && s.theme) {
    document.documentElement.setAttribute('data-theme', s.theme);
  }
}

function resetData() {
  Object.keys(DEMO_DATA).forEach(key => { DB.set(key, DEMO_DATA[key]); });
  localStorage.setItem('crm_initialized', '1');
}

/* ── Init on load ── */
document.addEventListener('DOMContentLoaded', initData);
