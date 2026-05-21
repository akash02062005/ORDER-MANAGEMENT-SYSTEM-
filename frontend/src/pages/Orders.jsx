import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Truck, CheckCircle, XCircle, ShoppingBag, X, Tag, User as UserIcon, Calendar, CreditCard, Plus, Save, Package, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useOrders } from '../hooks/useOrders';
import AnimatedCard from '../components/ui/AnimatedCard';
import StatusBadge from '../components/ui/StatusBadge';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import api from '../services/api';
import { staggerContainer, itemFadeIn } from '../animations/fadeAnimation';
import './Orders.css';

const AddOrderModal = ({ onClose, onAdded }) => {
    const [form, setForm] = useState({ customerName: '', status: 'PENDING' });
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [manualItems, setManualItems] = useState('');
    const [mode, setMode] = useState('products'); // 'products' | 'manual'

    useEffect(() => {
        api.get('/products').then(res => setProducts(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const addProduct = (product) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: Number(product.price) || 0 }];
        });
    };

    const adjustQty = (productId, delta) => {
        setSelectedItems(prev => prev.map(i => {
            if (i.productId === productId) {
                const newQty = Math.max(0, i.quantity + delta);
                return newQty === 0 ? null : { ...i, quantity: newQty };
            }
            return i;
        }).filter(Boolean));
    };

    const totalAmount = selectedItems.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.customerName.trim()) return toast.error('Customer name is required');

        let items;
        if (mode === 'products') {
            if (selectedItems.length === 0) return toast.error('Add at least one product');
            items = selectedItems;
        } else {
            items = manualItems ? manualItems.split(',').map(i => ({ productName: i.trim(), quantity: 1, unitPrice: 0 })) : [];
        }

        try {
            setSaving(true);
            const payload = {
                customerName: form.customerName,
                totalAmount: mode === 'products' ? totalAmount : parseFloat(form.totalAmount) || 0,
                status: form.status,
                items,
            };
            const { data } = await api.post('/orders', payload);
            toast.success('Order created successfully!');
            onAdded(data);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create order');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.65rem 1rem', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none', width: '100%' };
    const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div className="modal-content glass" style={{ maxWidth: 560 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="outfit">Create New Order</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 0 1rem' }}>
                    <div><label style={labelStyle}>Customer Name *</label><input style={inputStyle} name="customerName" value={form.customerName} onChange={handleChange} placeholder="e.g. Priya Sharma" required /></div>

                    {/* Mode toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setMode('products')}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${mode === 'products' ? 'hsl(var(--primary))' : 'var(--glass-border)'}`, background: mode === 'products' ? 'rgba(99,102,241,0.15)' : 'transparent', color: mode === 'products' ? '#a5b4fc' : 'var(--text-dim)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                            <Package size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> From Products
                        </button>
                        <button type="button" onClick={() => setMode('manual')}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${mode === 'manual' ? 'hsl(var(--primary))' : 'var(--glass-border)'}`, background: mode === 'manual' ? 'rgba(99,102,241,0.15)' : 'transparent', color: mode === 'manual' ? '#a5b4fc' : 'var(--text-dim)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                            <Tag size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Manual Entry
                        </button>
                    </div>

                    {mode === 'products' ? (
                        <>
                            {/* Product grid */}
                            <div>
                                <label style={labelStyle}>Select Products</label>
                                <div style={{ maxHeight: 180, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: 4 }}>
                                    {products.length > 0 ? products.map(p => {
                                        const sel = selectedItems.find(i => i.productId === p.id);
                                        return (
                                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: sel ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${sel ? 'rgba(99,102,241,0.3)' : 'transparent'}`, cursor: 'pointer' }}
                                                onClick={() => !sel && addProduct(p)}>
                                                <Package size={16} color="#6366f1" />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>₹{Number(p.price).toLocaleString()} · {p.stock} in stock</div>
                                                </div>
                                                {sel ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button type="button" onClick={e => { e.stopPropagation(); adjustQty(p.id, -1); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><Minus size={12} /></button>
                                                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{sel.quantity}</span>
                                                        <button type="button" onClick={e => { e.stopPropagation(); adjustQty(p.id, 1); }} style={{ background: 'rgba(99,102,241,0.2)', border: 'none', borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a5b4fc' }}><Plus size={12} /></button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Click to add</span>
                                                )}
                                            </div>
                                        );
                                    }) : <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No products found. Add products first or use manual entry.</div>}
                                </div>
                            </div>

                            {/* Selected items summary */}
                            {selectedItems.length > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.06)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                                        <span>{selectedItems.reduce((s, i) => s + i.quantity, 0)} items</span>
                                        <span style={{ color: '#a5b4fc' }}>Total: ₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div><label style={labelStyle}>Order Amount (₹) *</label><input style={inputStyle} type="number" name="totalAmount" value={form.totalAmount || ''} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required /></div>
                            <div><label style={labelStyle}>Items (comma-separated, optional)</label><input style={inputStyle} value={manualItems} onChange={e => setManualItems(e.target.value)} placeholder="Wireless Earbuds, USB Hub" /></div>
                        </>
                    )}

                    <div>
                        <label style={labelStyle}>Status</label>
                        <select style={{ ...inputStyle, cursor: 'pointer' }} name="status" value={form.status} onChange={handleChange}>
                            <option value="PENDING">Pending</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={saving}><Save size={16} /> Create Order</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Orders = () => {
    const { t } = useTranslation();
    const { orders, loading, updateStatus, refresh } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [addOpen, setAddOpen] = useState(false);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             o.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusUpdate = async (id, status) => {
        await updateStatus(id, status);
        toast.success(`Order marked as ${status.toLowerCase()}`);
        if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    };

    if (loading) return <Loader size="lg" />;

    return (
        <motion.div className="orders-page" variants={staggerContainer} initial="initial" animate="animate">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="outfit">{t('order_management')}</h1>
                    <p>{t('order_management_desc')}</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder={t('search_orders')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-dropdown-container">
                        <select className="status-select glass" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="ALL">{t('all_status')}</option>
                            <option value="PENDING">{t('pending_status')}</option>
                            <option value="SHIPPED">{t('shipped_status')}</option>
                            <option value="DELIVERED">{t('delivered_status')}</option>
                            <option value="CANCELLED">{t('cancelled_status')}</option>
                        </select>
                    </div>
                    <Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={18} /> New Order</Button>
                </div>
            </header>

            {/* Order stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Total', value: orders.length, color: '#6366f1' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: '#f59e0b' },
                    { label: 'Shipped', value: orders.filter(o => o.status === 'SHIPPED').length, color: '#3b82f6' },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#22c55e' },
                ].map((s, i) => (
                    <motion.div key={i} className="glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ padding: '1rem 1.25rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{s.label}</span>
                        <span className="outfit" style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</span>
                    </motion.div>
                ))}
            </div>

            <AnimatedCard className="orders-card">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('customer')}</th>
                                <th>{t('date')}</th>
                                <th>{t('amount')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <motion.tr key={order.id} variants={itemFadeIn}>
                                    <td className="order-id">#{order.id?.slice(-6).toUpperCase()}</td>
                                    <td className="customer-cell">
                                        <div className="avatar">{order.customerName?.[0]}</div>
                                        <span>{order.customerName}</span>
                                    </td>
                                    <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="amount-cell">₹{Number(order.totalAmount || 0).toLocaleString()}</td>
                                    <td><StatusBadge status={order.status} /></td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button className="action-btn view" title="View Details" onClick={() => setSelectedOrder(order)}><Eye size={18} /></button>
                                            {order.status === 'PENDING' && (
                                                <button className="action-btn approve" title="Mark Shipped" onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}><Truck size={18} /></button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button className="action-btn complete" title="Mark Delivered" onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}><CheckCircle size={18} /></button>
                                            )}
                                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                                <button className="action-btn cancel" title="Cancel Order" onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}><XCircle size={18} /></button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="empty-state">
                            <ShoppingBag size={48} />
                            <p>{t('no_orders_found')}</p>
                        </div>
                    )}
                </div>
            </AnimatedCard>

            <AnimatePresence>
                {addOpen && <AddOrderModal onClose={() => setAddOpen(false)} onAdded={() => refresh()} />}

                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <motion.div className="modal-content glass" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="outfit">{t('order_details')}</h3>
                                <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-section">
                                    <div className="info-box"><Tag size={16} /><div><label>{t('order_id')}</label><p>#{selectedOrder.id?.toUpperCase()}</p></div></div>
                                    <div className="info-box"><UserIcon size={16} /><div><label>{t('customer')}</label><p>{selectedOrder.customerName}</p></div></div>
                                    <div className="info-box"><Calendar size={16} /><div><label>{t('date')}</label><p>{new Date(selectedOrder.createdAt).toLocaleString()}</p></div></div>
                                    <div className="info-box"><CreditCard size={16} /><div><label>{t('amount')}</label><p>₹{Number(selectedOrder.totalAmount || 0).toLocaleString()}</p></div></div>
                                </div>
                                {selectedOrder.items?.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</label>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                                    <span>{item.productName}</span>
                                                    <span style={{ color: 'var(--text-dim)' }}>×{item.quantity || item.qty || 1}{item.unitPrice ? ` · ₹${Number(item.unitPrice).toLocaleString()}` : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="status-tracker" style={{ marginTop: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                                    <div className="current-status" style={{ marginTop: '0.5rem' }}><StatusBadge status={selectedOrder.status} /></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                .close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px; cursor: pointer; color: var(--text-dim); display: flex; }
                .close-btn:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </motion.div>
    );
};

export default Orders;
