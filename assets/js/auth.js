/* ============================================================
   NEXUS CRM — AUTHENTICATION
   ============================================================ */

const Auth = {
  SESSION_KEY: 'crm_session',

  login(email, password) {
    const users = DB.getAll('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, error: 'Invalid email or password.' };
    if (user.status === 'inactive') return { success: false, error: 'Your account is inactive. Contact admin.' };
    const session = { userId: user.id, role: user.role, email: user.email, name: user.name, loginAt: new Date().toISOString() };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    // Update lastLogin
    user.lastLogin = new Date().toISOString().split('T')[0];
    DB.save('users', user);
    return { success: true, user, session };
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  register(data) {
    const users = DB.getAll('users');
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: DB.nextId('users'),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'agent',
      avatar: null,
      department: 'Sales',
      phone: '',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null
    };
    DB.save('users', newUser);
    return { success: true, user: newUser };
  },

  getSession() {
    try { const s = localStorage.getItem(this.SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  },

  getCurrentUser() {
    const s = this.getSession();
    if (!s) return null;
    return DB.getById('users', s.userId);
  },

  isAuthenticated() { return !!this.getSession(); },

  hasRole(role) {
    const s = this.getSession();
    if (!s) return false;
    const hierarchy = { admin: 4, manager: 3, agent: 2, viewer: 1 };
    return (hierarchy[s.role] || 0) >= (hierarchy[role] || 0);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  requireRole(role) {
    if (!this.requireAuth()) return false;
    if (!this.hasRole(role)) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }
};
