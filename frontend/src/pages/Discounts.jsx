import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Copy, Trash2, Zap, Percent, Calendar, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Discounts.css';

const MOCK_COUPONS = [
  { id: 'c1', code: 'WELCOME20', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 500, maxUses: 100, usedCount: 34, expiryDate: '2026-12-31', active: true },
  { id: 'c2', code: 'FLAT100', discountType: 'FLAT', discountValue: 100, minOrderValue: 1000, maxUses: 50, usedCount: 12, expiryDate: '2026-06-30', active: true },
  { id: 'c3', code: 'SUMMER15', discountType: 'PERCENTAGE', discountValue: 15, minOrderValue: 0, maxUses: 200, usedCount: 89, expiryDate: '2026-05-31', active: false },
];

const Discounts = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      const data = Array.isArray(res.data) ? res.data : [];
      setCoupons(data.length > 0 ? data : MOCK_COUPONS);
    } catch {
      setCoupons(MOCK_COUPONS);
    } finally {
      setLoading(false);
    }
  };

  const copy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied ' + code);
  };

  const toggle = async (id) => {
    try {
      const res = await api.post('/coupons/' + id + '/toggle');
      setCoupons(c => c.map(x => x.id === id ? res.data : x));
      toast.success('Coupon status updated');
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const remove = async (id, code) => {
    if (!window.confirm('Delete coupon "' + code + '"?')) return;
    try {
      await api.delete('/coupons/' + id);
      setCoupons(c => c.filter(x => x.id !== id));
      toast.info('Coupon removed');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const add = async (form) => {
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        usageLimit: Number(form.limit),
        usageCount: 0,
        expiresAt: form.expires,
        active: true,
      };
      const res = await api.post('/coupons', payload);
      setCoupons(prev => [res.data, ...prev]);
      setCreating(false);
      toast.success('Coupon created successfully');
    } catch {
      toast.error('Failed to create coupon');
    }
  };

  if (loading) return (
    <motion.div className="disc-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>
        <RefreshCw size={32} className="spinning" />
        <p style={{ marginTop: '12px' }}>Loading coupons...</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div className="disc-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Discounts & Coupons</h1>
          <p>Create promotional codes to drive sales</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New Coupon</button>
      </header>

      {coupons.length === 0 ? (
        <AnimatedCard>
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
            <Tag size={40} />
            <p style={{ marginTop: '12px' }}>No coupons yet. Create your first discount code.</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="disc-grid">
          {coupons.map((c, i) => {
            const uses = c.usageCount != null ? c.usageCount : 0;
            const limit = c.usageLimit != null ? c.usageLimit : 100;
            const expires = c.expiresAt || '';
            const pct = limit > 0 ? Math.min(100, (uses / limit) * 100) : 0;
            return (
              <motion.div key={c.id} className={'coupon-card' + (!c.active ? ' inactive' : '')}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: i * 0.08, type: 'spring' }}
                whileHover={{ y: -6, scale: 1.02 }}>
                <div className="coupon-left">
                  <div className="coupon-icon">{c.type === 'PERCENT' ? <Percent /> : <Tag />}</div>
                </div>
                <div className="coupon-divider"></div>
                <div className="coupon-right">
                  <div className="coupon-top">
                    <span className="c-label">DISCOUNT CODE</span>
                    <button className="c-toggle" onClick={() => toggle(c.id)}>{c.active ? 'Active' : 'Inactive'}</button>
                  </div>
                  <h3 className="c-code outfit" onClick={() => copy(c.code)}>{c.code} <Copy size={14} /></h3>
                  <div className="c-value">{c.type === 'PERCENT' ? c.value + '% OFF' : '₹' + c.value + ' OFF'}</div>
                  <div className="c-meta">
                    <span><Zap size={11} /> {uses}/{limit} uses</span>
                    <span><Calendar size={11} /> {expires}</span>
                  </div>
                  <div className="c-bar"><div className="c-fill" style={{ width: pct + '%' }} /></div>
                  <button className="c-delete" onClick={() => remove(c.id, c.code)}><Trash2 size={12} /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {creating && <CouponForm onClose={() => setCreating(false)} onAdd={add} />}
      </AnimatePresence>
    </motion.div>
  );
};

const CouponForm = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: 10, limit: 100, expires: '2026-12-31' });
  const set = (k) => (e) => setForm(f => Object.assign({}, f, { [k]: e.target.value }));
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal glass" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3 className="outfit">Create Coupon</h3><button onClick={onClose}><X size={18} /></button></div>
        <form className="inv-form" onSubmit={e => { e.preventDefault(); onAdd(form); }}>
          <label>Code<input required value={form.code} onChange={e => setForm(f => Object.assign({}, f, { code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" /></label>
          <label>Type
            <select value={form.type} onChange={set('type')}>
              <option value="PERCENT">Percent (%)</option>
              <option value="FLAT">Flat Amount (Rs.)</option>
            </select>
          </label>
          <label>Value<input required type="number" min="1" value={form.value} onChange={set('value')} /></label>
          <label>Usage Limit<input required type="number" min="1" value={form.limit} onChange={set('limit')} /></label>
          <label>Expiry Date<input required type="date" value={form.expires} onChange={set('expires')} /></label>
          <button className="btn-primary" type="submit">Create Coupon</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Discounts;
