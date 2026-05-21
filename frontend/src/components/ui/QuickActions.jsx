import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Package, UserPlus, Send, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const actions = [
  { icon: <FileText />, label: 'New Invoice', path: '/invoices', color: '#6366f1' },
  { icon: <Package />, label: 'Add Product', path: '/products', color: '#f59e0b' },
  { icon: <UserPlus />, label: 'New Customer', path: '/customers', color: '#ec4899' },
  { icon: <Sparkles />, label: 'Ask AI', path: '/ai', color: '#8b5cf6' },
];

const QuickActions = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="quick-fab">
      <AnimatePresence>
        {open && actions.map((a, i) => (
          <motion.button key={a.label}
            className="fab-item"
            initial={{ scale: 0, y: 0, opacity: 0 }}
            animate={{ scale: 1, y: -(i + 1) * 64, opacity: 1 }}
            exit={{ scale: 0, y: 0, opacity: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
            onClick={() => { navigate(a.path); setOpen(false); }}
            style={{ background: a.color }}>
            {a.icon}
            <span className="fab-label">{a.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button className="fab-main"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}>
        <Plus />
      </motion.button>
    </div>
  );
};

export default QuickActions;
