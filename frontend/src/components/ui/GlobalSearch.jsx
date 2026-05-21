import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ShoppingBag, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GlobalSearch.css';

const mockResults = [
  { type: 'order', icon: <ShoppingBag />, label: 'Order #ORD-2041', meta: 'Aarav Sharma · ₹4,200', path: '/orders' },
  { type: 'customer', icon: <Users />, label: 'Priya Patel', meta: '12 orders · ₹48,200 LTV', path: '/customers' },
  { type: 'product', icon: <Package />, label: 'Wireless Earbuds Pro', meta: '32 in stock · ₹3,499', path: '/products' },
  { type: 'invoice', icon: <FileText />, label: 'INV-2026042', meta: 'Globex · ₹8,500 · PAID', path: '/invoices' },
];

const GlobalSearch = () => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const filtered = mockResults.filter(r => r.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="gsearch" ref={ref}>
      <div className="gs-input" onClick={() => setOpen(true)}>
        <Search size={16} />
        <input placeholder="Search orders, customers, products..." value={q} onChange={e => setQ(e.target.value)} onFocus={() => setOpen(true)} />
        <kbd>⌘K</kbd>
      </div>
      <AnimatePresence>
        {open && q && (
          <motion.div className="gs-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}>
            {filtered.length > 0 ? filtered.map((r, i) => (
              <div key={i} className="gs-result" onClick={() => { navigate(r.path); setOpen(false); setQ(''); }}>
                <div className={`gs-icon ${r.type}`}>{r.icon}</div>
                <div className="gs-info">
                  <b>{r.label}</b>
                  <span>{r.meta}</span>
                </div>
                <span className="gs-type">{r.type}</span>
              </div>
            )) : <div className="gs-empty">No results for "{q}"</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
