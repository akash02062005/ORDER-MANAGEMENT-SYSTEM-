import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Hash, Command } from 'lucide-react';
import './CommandPalette.css';

const commands = [
  { id: 'dash', label: 'Go to Dashboard', path: '/', category: 'Navigate', shortcut: 'G D' },
  { id: 'orders', label: 'Go to Orders', path: '/orders', category: 'Navigate', shortcut: 'G O' },
  { id: 'products', label: 'Go to Products', path: '/products', category: 'Navigate', shortcut: 'G P' },
  { id: 'customers', label: 'Go to Customers', path: '/customers', category: 'Navigate', shortcut: 'G C' },
  { id: 'analytics', label: 'Go to Analytics', path: '/analytics', category: 'Navigate' },
  { id: 'invoices', label: 'Go to Invoices', path: '/invoices', category: 'Navigate' },
  { id: 'inventory', label: 'Go to Inventory', path: '/inventory', category: 'Navigate' },
  { id: 'team', label: 'Go to Team', path: '/team', category: 'Navigate' },
  { id: 'integrations', label: 'Go to Integrations', path: '/integrations', category: 'Navigate' },
  { id: 'ai', label: 'Open AI Insights', path: '/ai', category: 'Navigate' },
  { id: 'shipments', label: 'Go to Shipments', path: '/shipments', category: 'Navigate' },
  { id: 'discounts', label: 'Go to Discounts', path: '/discounts', category: 'Navigate' },
  { id: 'reports', label: 'Generate Reports', path: '/reports', category: 'Navigate' },
  { id: 'activity', label: 'View Activity Log', path: '/activity', category: 'Navigate' },
  { id: 'settings', label: 'Open Settings', path: '/settings', category: 'Navigate' },
  { id: 'billing', label: 'Billing & Subscription', path: '/billing', category: 'Navigate' },
  { id: 'new-order', label: 'Create New Order', path: '/orders?new=1', category: 'Actions' },
  { id: 'new-invoice', label: 'Create New Invoice', path: '/invoices', category: 'Actions' },
  { id: 'new-product', label: 'Add New Product', path: '/products?new=1', category: 'Actions' },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [query]);

  const go = (cmd) => { navigate(cmd.path); setOpen(false); setQuery(''); };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === 'Enter' && filtered[active]) go(filtered[active]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, active, filtered]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(c => { (g[c.category] ||= []).push(c); });
    return g;
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmd-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div className="cmd-palette"
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            onClick={e => e.stopPropagation()}>
            <div className="cmd-input">
              <Search size={18} />
              <input autoFocus placeholder="Type a command or search..." value={query} onChange={e => { setQuery(e.target.value); setActive(0); }} />
              <kbd>ESC</kbd>
            </div>
            <div className="cmd-list">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="cmd-group">
                  <div className="cmd-cat">{cat}</div>
                  {items.map((c, i) => {
                    const idx = filtered.indexOf(c);
                    return (
                      <div key={c.id} className={`cmd-item ${idx === active ? 'active' : ''}`} onClick={() => go(c)} onMouseEnter={() => setActive(idx)}>
                        <Hash size={14} />
                        <span>{c.label}</span>
                        {c.shortcut && <kbd>{c.shortcut}</kbd>}
                        <ArrowRight size={14} className="arr" />
                      </div>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && <div className="cmd-empty">No results for "{query}"</div>}
            </div>
            <div className="cmd-foot">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
