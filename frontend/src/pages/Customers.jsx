import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Mail, Phone, MapPin, ExternalLink, Edit, Trash2, X, Save, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { staggerContainer, itemFadeIn } from '../animations/fadeAnimation';
import { MOCK_CUSTOMERS } from '../services/mockData';
import './Orders.css';

const EMPTY_FORM = { name: '', email: '', phone: '', address: '' };

const CustomerModal = ({ customer, onClose, onSaved }) => {
    const isEdit = !!customer?.id;
    const [form, setForm] = useState(isEdit ? { name: customer.name, email: customer.email, phone: customer.phone || '', address: customer.address || '' } : EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Customer name is required');
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return toast.error('Valid email is required');

        try {
            setSaving(true);
            if (isEdit) {
                const { data } = await api.put(`/customers/${customer.id}`, form);
                toast.success('Customer updated successfully');
                onSaved(data, 'edit');
            } else {
                const { data } = await api.post('/customers', form);
                toast.success('Customer added successfully');
                onSaved(data, 'add');
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save customer');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="product-modal glass"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="outfit">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sharma" required />
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="priya@example.com" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91-9876543210" />
                        </div>
                        <div className="form-group">
                            <label>City / Address</label>
                            <input name="address" value={form.address} onChange={handleChange} placeholder="Mumbai, Maharashtra" />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={saving}>
                            <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Customer'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const CustomerDetailModal = ({ customer, onClose, onEdit, onDelete }) => (
    <div className="modal-overlay" onClick={onClose}>
        <motion.div
            className="product-modal glass"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
        >
            <div className="modal-header">
                <h2 className="outfit">Customer Profile</h2>
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                        {customer.name[0]}
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{customer.name}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{customer.totalOrders || 0} orders placed</span>
                    </div>
                </div>
                {[
                    { icon: <Mail size={16} />, label: 'Email', value: customer.email },
                    { icon: <Phone size={16} />, label: 'Phone', value: customer.phone || 'Not set' },
                    { icon: <MapPin size={16} />, label: 'Address', value: customer.address || 'Not set' },
                ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                        <span style={{ color: 'hsl(var(--primary))' }}>{row.icon}</span>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                            <div style={{ color: 'var(--text-main)' }}>{row.value}</div>
                        </div>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => { onClose(); setTimeout(() => onEdit(customer), 100); }}><Edit size={14} /> Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(customer)}><Trash2 size={14} /> Delete</Button>
                </div>
            </div>
        </motion.div>
    </div>
);

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [viewCustomer, setViewCustomer] = useState(null);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers');
            const data = Array.isArray(response.data) ? response.data : [];
            setCustomers(data.length > 0 ? data : MOCK_CUSTOMERS);
        } catch (error) {
            console.warn('Failed to fetch customers, using demo data');
            setCustomers(MOCK_CUSTOMERS);
        } finally {
            setLoading(false);
        }
    };

    const handleSaved = (saved, mode) => {
        if (mode === 'add') setCustomers(prev => [saved, ...prev]);
        else setCustomers(prev => prev.map(c => c.id === saved.id ? saved : c));
    };

    const handleDelete = async (customer) => {
        if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/customers/${customer.id}`);
            setCustomers(prev => prev.filter(c => c.id !== customer.id));
            setViewCustomer(null);
            toast.success('Customer deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete customer');
        }
    };

    const openAdd = () => { setEditCustomer(null); setModalOpen(true); };
    const openEdit = (c) => { setEditCustomer(c); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditCustomer(null); };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader size="lg" />;

    return (
        <motion.div className="orders-page" variants={staggerContainer} initial="initial" animate="animate">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="outfit">Customer Directory</h1>
                    <p>Manage and track your global customer base.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder="Search by name, email or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="primary" onClick={openAdd}><UserPlus size={18} /> Add Customer</Button>
                </div>
            </header>

            <div className="customers-grid">
                {filteredCustomers.map(customer => (
                    <AnimatedCard key={customer.id} className="customer-card-v2 glass">
                        <div className="customer-card-header">
                            <div className="customer-avatar-large outfit">{customer.name?.[0]}</div>
                            <div className="customer-header-info">
                                <h3>{customer.name}</h3>
                                <span>{customer.totalOrders || 0} Orders</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="action-btn edit" title="Edit" style={{ padding: '6px' }} onClick={() => openEdit(customer)}><Edit size={15} /></button>
                                <button className="action-btn cancel" title="Delete" style={{ padding: '6px' }} onClick={() => handleDelete(customer)}><Trash2 size={15} /></button>
                            </div>
                        </div>
                        <div className="customer-card-body">
                            <div className="info-item"><Mail size={16} /><span>{customer.email}</span></div>
                            <div className="info-item"><Phone size={16} /><span>{customer.phone || 'No phone set'}</span></div>
                            <div className="info-item"><MapPin size={16} /><span className="address-text">{customer.address || 'No address set'}</span></div>
                        </div>
                        <div className="customer-card-footer">
                            <div className="order-count-badge">
                                <strong>{customer.totalOrders || 0}</strong>
                                <span>Orders</span>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => setViewCustomer(customer)}>
                                View Profile <ExternalLink size={14} />
                            </Button>
                        </div>
                    </AnimatedCard>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="empty-state">
                    <UserIcon size={48} />
                    <p>{searchTerm ? 'No customers match your search.' : 'No customers yet. Click "Add Customer" to get started.'}</p>
                </div>
            )}

            <AnimatePresence>
                {modalOpen && <CustomerModal customer={editCustomer} onClose={closeModal} onSaved={handleSaved} />}
                {viewCustomer && <CustomerDetailModal customer={viewCustomer} onClose={() => setViewCustomer(null)} onEdit={openEdit} onDelete={handleDelete} />}
            </AnimatePresence>

            <style>{`
                .product-modal { width: 100%; max-width: 560px; padding: 2rem; border-radius: 24px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { font-size: 1.5rem; }
                .close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px; cursor: pointer; color: var(--text-dim); display: flex; }
                .close-btn:hover { background: rgba(255,255,255,0.1); }
                .product-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
                .form-group input, .form-group select { background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 10px; padding: 0.65rem 1rem; color: var(--text-main); font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
                .form-group input:focus, .form-group select:focus { border-color: hsl(var(--primary)); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
            `}</style>
        </motion.div>
    );
};

export default Customers;
