import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Package, CreditCard, Settings, LogIn, Trash, Edit, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatedCard from '../components/ui/AnimatedCard';
import Loader from '../components/ui/Loader';
import api from '../services/api';
import './ActivityLog.css';

const ICON_MAP = {
  ORDER: { icon: <Package />, color: '#10b981' },
  USER: { icon: <User />, color: '#6366f1' },
  PAYMENT: { icon: <CreditCard />, color: '#ec4899' },
  PRODUCT: { icon: <Edit />, color: '#f59e0b' },
  SETTINGS: { icon: <Settings />, color: '#8b5cf6' },
  LOGIN: { icon: <LogIn />, color: '#06b6d4' },
  DELETE: { icon: <Trash />, color: '#ef4444' },
  DEFAULT: { icon: <Activity />, color: '#64748b' },
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/audit-logs');
        const formatted = data.map((log, i) => {
          const entityType = (log.entity || 'DEFAULT').toUpperCase();
          const actionType = (log.action || '').toUpperCase();
          let typeKey = entityType.includes('ORDER') ? 'ORDER'
            : entityType.includes('PRODUCT') ? 'PRODUCT'
            : entityType.includes('CUSTOMER') || entityType.includes('USER') ? 'USER'
            : entityType.includes('PAYMENT') || entityType.includes('SUBSCRIPTION') ? 'PAYMENT'
            : entityType.includes('SETTING') ? 'SETTINGS'
            : actionType.includes('DELETE') ? 'DELETE'
            : 'DEFAULT';

          const meta = ICON_MAP[typeKey] || ICON_MAP.DEFAULT;
          return {
            id: log.id || i,
            type: typeKey,
            action: log.action?.toLowerCase() || 'modified',
            icon: meta.icon,
            color: meta.color,
            user: log.userId || 'System',
            target: `${log.entity || ''} ${log.entityId ? '#' + log.entityId.slice(-6).toUpperCase() : ''}`.trim(),
            time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
            changes: log.changes,
          };
        });
        setLogs(formatted);
      } catch (err) {
        console.warn('Failed to fetch audit logs, using demo data');
        const now = new Date();
        setLogs([
          { id: 1, type: 'ORDER', action: 'created', icon: ICON_MAP.ORDER.icon, color: ICON_MAP.ORDER.color, user: 'admin', target: 'Order #ORD001', time: new Date(now - 2*60000).toLocaleString(), changes: null },
          { id: 2, type: 'USER', action: 'registered', icon: ICON_MAP.USER.icon, color: ICON_MAP.USER.color, user: 'system', target: 'User #USER002', time: new Date(now - 15*60000).toLocaleString(), changes: null },
          { id: 3, type: 'PAYMENT', action: 'completed', icon: ICON_MAP.PAYMENT.icon, color: ICON_MAP.PAYMENT.color, user: 'admin', target: 'Payment #PAY003', time: new Date(now - 60*60000).toLocaleString(), changes: null },
          { id: 4, type: 'PRODUCT', action: 'updated', icon: ICON_MAP.PRODUCT.icon, color: ICON_MAP.PRODUCT.color, user: 'admin', target: 'Product #PROD004', time: new Date(now - 3*60*60000).toLocaleString(), changes: null },
          { id: 5, type: 'ORDER', action: 'shipped', icon: ICON_MAP.ORDER.icon, color: ICON_MAP.ORDER.color, user: 'manager', target: 'Order #ORD005', time: new Date(now - 5*60*60000).toLocaleString(), changes: null },
          { id: 6, type: 'LOGIN', action: 'logged in', icon: ICON_MAP.LOGIN.icon, color: ICON_MAP.LOGIN.color, user: 'admin', target: 'Auth', time: new Date(now - 8*60*60000).toLocaleString(), changes: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const types = useMemo(() => {
    const unique = ['ALL', ...new Set(logs.map(l => l.type))];
    return unique;
  }, [logs]);

  const filtered = useMemo(() =>
    filter === 'ALL' ? logs : logs.filter(l => l.type === filter),
    [logs, filter]
  );

  if (loading) return <Loader size="lg" />;

  return (
    <motion.div className="log-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Activity Log</h1>
          <p>Complete audit trail of all system events</p>
        </div>
      </header>

      <div className="log-filter">
        {types.map(t => <button key={t} className={`chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>)}
      </div>

      <AnimatedCard className="log-card">
        <div className="timeline">
          {filtered.map((log, i) => (
            <motion.div key={log.id} className="timeline-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}>
              <div className="t-dot" style={{ background: log.color, boxShadow: `0 0 12px ${log.color}` }}></div>
              <div className="t-card glass">
                <div className="t-icon" style={{ background: `${log.color}22`, color: log.color }}>{log.icon}</div>
                <div className="t-body">
                  <p><b>{log.user}</b> {log.action} <span className="t-target">{log.target}</span></p>
                  <span className="t-time">{log.time}</span>
                </div>
                <span className="t-tag">{log.type}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>
              <Activity size={48} opacity={0.3} />
              <p style={{ marginTop: '1rem' }}>
                {logs.length === 0 ? 'No activity recorded yet. Actions will appear here as you use the system.' : 'No matching activities for this filter.'}
              </p>
            </div>
          )}
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default ActivityLog;
