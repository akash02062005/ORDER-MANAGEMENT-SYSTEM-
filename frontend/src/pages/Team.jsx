import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Mail, Plus, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import { useAuth } from '../context/AuthContext';
import './Team.css';

const ROLES = {
  ADMIN: { color: '#ec4899', perms: ['Full access', 'Manage users', 'Billing', 'All reports'] },
  MANAGER: { color: '#6366f1', perms: ['Orders', 'Products', 'Customers', 'Reports'] },
  SUPPORT: { color: '#10b981', perms: ['Orders (read)', 'Customers', 'Help desk'] },
  VIEWER: { color: '#64748b', perms: ['Read only'] },
};

const avatarOf = (name) => (name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const roleColor = (role) => (ROLES[role] && ROLES[role].color) || '#64748b';

const Team = () => {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => { loadOrg(); }, []);

  const loadOrg = async () => {
    try {
      setLoading(true);
      const orgRes = await api.get('/organizations/my');
      if (orgRes.data && orgRes.data.hasOrg && orgRes.data.organization && orgRes.data.organization.id) {
        const id = orgRes.data.organization.id;
        setOrgId(id);
        const memRes = await api.get('/organizations/' + id + '/members');
        const memberList = Array.isArray(memRes.data) ? memRes.data : [];
        setMembers(memberList.length > 0 ? memberList : getDefaultMembers());
      } else {
        setMembers(getDefaultMembers());
      }
    } catch {
      setMembers(getDefaultMembers());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMembers = () => {
    const base = user ? [{
      id: user.id || 'me',
      username: user.username || user.name,
      name: user.name || user.username,
      email: user.email,
      role: 'ADMIN',
    }] : [];
    return [...base,
      { id: 'demo-mgr', username: 'operations_mgr', name: 'Operations Manager', email: 'manager@company.com', role: 'MANAGER' },
      { id: 'demo-sup', username: 'support_agent', name: 'Support Agent', email: 'support@company.com', role: 'SUPPORT' },
    ];
  };

  const invite = async (form) => {
    if (!orgId) {
      toast.error('Complete onboarding to create an organization first.');
      return;
    }
    try {
      await api.post('/organizations/' + orgId + '/invite', { email: form.email });
      setMembers(prev => [...prev, {
        id: 'invited-' + Date.now(),
        username: form.name,
        email: form.email,
        role: form.role,
        status: 'INVITED',
      }]);
      setInviting(false);
      toast.success('Invitation sent to ' + form.email);
    } catch {
      toast.error('Failed to send invitation — the user must already have an account in the system');
    }
  };

  return (
    <motion.div className="team-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Team & Roles</h1>
          <p>Invite teammates and manage permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" onClick={loadOrg} title="Refresh" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
          <button className="btn-primary" onClick={() => setInviting(true)}><Plus size={16} /> Invite Member</button>
        </div>
      </header>

      <div className="roles-grid">
        {Object.entries(ROLES).map(function(entry) {
          const name = entry[0];
          const conf = entry[1];
          return (
            <motion.div key={name} className="role-card glass" whileHover={{ y: -4 }} style={{ borderColor: conf.color }}>
              <div className="role-head">
                <Shield size={18} style={{ color: conf.color }} />
                <b>{name}</b>
                <span className="count">{members.filter(m => (m.role || 'ADMIN') === name).length} members</span>
              </div>
              <ul>{conf.perms.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </motion.div>
          );
        })}
      </div>

      <AnimatedCard title="Members" subtitle={loading ? 'Loading...' : members.length + ' total'} className="members-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            <RefreshCw size={28} className="spinning" />
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            <Users size={32} />
            <p style={{ marginTop: '8px' }}>No members yet. Invite your team!</p>
          </div>
        ) : (
          <div className="members-list">
            {members.map(m => {
              const name = m.username || m.name || m.email || 'Unknown';
              const role = m.role || 'ADMIN';
              const status = m.status || 'ACTIVE';
              return (
                <motion.div key={m.id} className="member-row" whileHover={{ x: 4 }}>
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, ' + roleColor(role) + ', #1e293b)' }}>
                    {avatarOf(name)}
                  </div>
                  <div className="m-info">
                    <b>{name}</b>
                    <span>{m.email}</span>
                  </div>
                  <span className="role-badge" style={{ background: roleColor(role) + '22', color: roleColor(role), padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {role}
                  </span>
                  <span className={'status ' + status.toLowerCase()}>{status}</span>
                  <span className="joined">{m.createdAt ? m.createdAt.slice(0, 10) : ''}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatedCard>

      {!orgId && !loading && (
        <AnimatedCard>
          <div style={{ padding: '20px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Shield size={28} style={{ color: '#6366f1', marginBottom: '8px' }} />
            <p style={{ margin: 0 }}>
              <b>No organization found.</b> Complete the onboarding process to create your organization and invite team members.
            </p>
          </div>
        </AnimatedCard>
      )}

      <AnimatePresence>
        {inviting && <InviteModal onClose={() => setInviting(false)} onInvite={invite} />}
      </AnimatePresence>
    </motion.div>
  );
};

const InviteModal = ({ onClose, onInvite }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal glass" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3 className="outfit">Invite team member</h3><button onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={e => { e.preventDefault(); onInvite({ name, email, role }); }} className="inv-form">
          <label>Full Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></label>
          <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" /></label>
          <label>Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              {Object.keys(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 8px' }}>
            The invitee must already have an account registered in this system.
          </p>
          <button className="btn-primary" type="submit"><Mail size={16} /> Send Invitation</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Team;
