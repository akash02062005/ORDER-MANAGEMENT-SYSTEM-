import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package, TrendingDown, BarChart3, Box, Warehouse, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingId, setAdjustingId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/products');
      setItems(res.data.map(p => ({
        ...p,
        reorderLevel: p.reorderLevel || 10,
        warehouse: p.warehouse || ['Mumbai', 'Delhi', 'Bangalore'][Math.abs(hashCode(p.id || p.name)) % 3]
      })));
    } catch { setItems(seedItems()); }
    finally { setLoading(false); }
  };

  const hashCode = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  };

  const seedItems = () => Array.from({ length: 10 }, (_, i) => ({
    id: `seed-${i + 1}`, name: `Product ${i + 1}`, price: 499 + i * 100,
    stock: Math.floor(Math.random() * 80), reorderLevel: 10,
    warehouse: ['Mumbai', 'Delhi', 'Bangalore'][i % 3]
  }));

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter(i => i.stock <= i.reorderLevel && i.stock > 0).length,
    outOfStock: items.filter(i => i.stock === 0).length,
    value: items.reduce((s, i) => s + ((Number(i.price) || 0) * i.stock), 0),
  }), [items]);

  const adjustStock = async (id, delta) => {
    if (adjustingId) return; // prevent double-click
    setAdjustingId(id);
    try {
      const { data } = await api.patch(`/products/${id}/stock?delta=${delta}`);
      setItems(list => list.map(i => i.id === id ? { ...i, stock: data.stock } : i));
      toast.success(`Stock ${delta > 0 ? 'increased by ' + delta : 'decreased by ' + Math.abs(delta)}`);
    } catch (err) {
      // Fallback for demo items without backend
      setItems(list => list.map(i => i.id === id ? { ...i, stock: Math.max(0, (i.stock || 0) + delta) } : i));
      toast.success(`Stock ${delta > 0 ? 'increased' : 'decreased'} (local)`);
    } finally {
      setAdjustingId(null);
    }
  };

  const filteredItems = items.filter(i =>
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.warehouse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div className="inventory-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Inventory Management</h1>
          <p>Track stock, reorder levels and warehouse distribution</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: 10, padding: '0.5rem 0.75rem 0.5rem 2.25rem', color: 'var(--text-main)',
                fontSize: '0.85rem', outline: 'none', width: 200
              }}
            />
          </div>
          <button onClick={load} style={{
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 10, padding: '0.5rem 1rem', color: '#6366f1', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem'
          }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <div className="inv-stats">
        <StatBox icon={<Package />} label="Total SKUs" value={stats.total} color="#6366f1" />
        <StatBox icon={<AlertTriangle />} label="Low Stock" value={stats.lowStock} color="#f59e0b" />
        <StatBox icon={<TrendingDown />} label="Out of Stock" value={stats.outOfStock} color="#ef4444" />
        <StatBox icon={<BarChart3 />} label="Inventory Value" value={`₹${stats.value.toLocaleString()}`} color="#10b981" />
      </div>

      <AnimatedCard title="Stock Alerts" subtitle="Items needing attention" className="alerts-card">
        <AnimatePresence>
          {filteredItems.filter(i => i.stock <= i.reorderLevel).map((item, i) => (
            <motion.div key={item.id} className={`alert-row ${item.stock === 0 ? 'critical' : 'warning'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}>
              <div className="alert-icon">{item.stock === 0 ? <AlertTriangle /> : <Box />}</div>
              <div className="alert-info">
                <b>{item.name}</b>
                <span>{item.stock === 0 ? 'Out of stock - Reorder immediately' : `Only ${item.stock} units left (reorder at ${item.reorderLevel})`}</span>
              </div>
              <button className="restock-btn" onClick={() => adjustStock(item.id, 50)} disabled={adjustingId === item.id}>
                {adjustingId === item.id ? '...' : '+50 Restock'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredItems.filter(i => i.stock <= i.reorderLevel).length === 0 && (
          <div className="empty-alerts">All inventory is healthy</div>
        )}
      </AnimatedCard>

      <AnimatedCard title="Stock Levels" subtitle="Real-time warehouse data" className="stock-card">
        <div className="stock-grid">
          {filteredItems.map(item => {
            const pct = Math.min(100, (item.stock / (item.reorderLevel * 4)) * 100);
            const color = item.stock === 0 ? '#ef4444' : item.stock <= item.reorderLevel ? '#f59e0b' : '#10b981';
            return (
              <motion.div key={item.id} className="stock-item glass" whileHover={{ y: -4 }}>
                <div className="stock-head">
                  <b>{item.name}</b>
                  <span className="warehouse"><Warehouse size={12} /> {item.warehouse}</span>
                </div>
                <div className="stock-bar-wrap">
                  <motion.div className="stock-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ background: color }} />
                </div>
                <div className="stock-foot">
                  <span>{item.stock} in stock</span>
                  <div className="adj-btns">
                    <button onClick={() => adjustStock(item.id, -1)} disabled={adjustingId === item.id || item.stock <= 0}>−</button>
                    <button onClick={() => adjustStock(item.id, 1)} disabled={adjustingId === item.id}>+</button>
                    <button onClick={() => adjustStock(item.id, 10)} disabled={adjustingId === item.id}
                      style={{ fontSize: '0.7rem', padding: '2px 6px' }}>+10</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

const StatBox = ({ icon, label, value, color }) => (
  <motion.div className="stat-box glass" whileHover={{ y: -4 }}>
    <div className="s-icon" style={{ background: `${color}22`, color }}>{icon}</div>
    <div>
      <span>{label}</span>
      <h3 className="outfit">{value}</h3>
    </div>
  </motion.div>
);

export default Inventory;
