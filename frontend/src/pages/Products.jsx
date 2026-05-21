import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Package, Trash2, Edit, AlertTriangle, X, Save, ImagePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { staggerContainer, itemFadeIn } from '../animations/fadeAnimation';
import { MOCK_PRODUCTS } from '../services/mockData';
import './Orders.css';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' };
const CATEGORIES = ['Electronics', 'Accessories', 'Peripherals', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Other'];

const ProductModal = ({ product, onClose, onSaved }) => {
    const isEdit = !!product?.id;
    const [form, setForm] = useState(isEdit ? { ...product, price: product.price?.toString(), stock: product.stock?.toString() } : EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Product name is required');
        if (!form.price || isNaN(form.price) || Number(form.price) < 0) return toast.error('Enter a valid price');
        if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) return toast.error('Enter a valid stock quantity');

        try {
            setSaving(true);
            const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) };
            if (isEdit) {
                const { data } = await api.put(`/products/${product.id}`, payload);
                toast.success('Product updated successfully');
                onSaved(data, 'edit');
            } else {
                const { data } = await api.post('/products', payload);
                toast.success('Product added successfully');
                onSaved(data, 'add');
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
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
                    <h2 className="outfit">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Earbuds Pro" required />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." rows={3} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Price (₹) *</label>
                            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Stock Quantity *</label>
                            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><ImagePlus size={14} style={{ marginRight: 6 }} />Image URL</label>
                        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                        {form.imageUrl && (
                            <img src={form.imageUrl} alt="preview" style={{ marginTop: 8, width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display = 'none'} />
                        )}
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={saving}>
                            <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            const data = Array.isArray(response.data) ? response.data : [];
            setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
        } catch (error) {
            console.warn('Failed to fetch products, using demo data');
            setProducts(MOCK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    };

    const handleSaved = (savedProduct, mode) => {
        if (mode === 'add') {
            setProducts(prev => [savedProduct, ...prev]);
        } else {
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/products/${product.id}`);
            setProducts(prev => prev.filter(p => p.id !== product.id));
            toast.success('Product deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const openAdd = () => { setEditProduct(null); setModalOpen(true); };
    const openEdit = (product) => { setEditProduct(product); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditProduct(null); };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader size="lg" />;

    return (
        <motion.div className="orders-page" variants={staggerContainer} initial="initial" animate="animate">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="outfit">Inventory Matrix</h1>
                    <p>Global stock management and catalog control.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder="Search products or categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="primary" onClick={openAdd}><Plus size={18} /> New Product</Button>
                </div>
            </header>

            <AnimatedCard className="orders-card glass">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Unit Price</th>
                                <th>Inventory</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <motion.tr key={product.id} variants={itemFadeIn}>
                                    <td className="product-cell">
                                        <div className="product-info-box">
                                            {product.imageUrl
                                                ? <img src={product.imageUrl} alt={product.name} className="product-img-v2" onError={e => { e.target.style.display='none'; }} />
                                                : <div className="product-img-v2" style={{ background: 'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={20} color="#6366f1" /></div>
                                            }
                                            <div className="product-text">
                                                <span className="p-name">{product.name}</span>
                                                <span className="p-id">ID: {product.id?.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="category-pill">{product.category}</span></td>
                                    <td className="amount-cell">₹{Number(product.price).toLocaleString()}</td>
                                    <td>
                                        <div className="stock-wrapper">
                                            <span className={`stock-count ${product.stock < 10 ? 'critical' : ''}`}>{product.stock}</span>
                                            <span className="stock-label">units</span>
                                        </div>
                                    </td>
                                    <td>
                                        {product.stock < 10
                                            ? <div className="status-indicator low-stock"><AlertTriangle size={14} /> Low Stock</div>
                                            : <div className="status-indicator in-stock"><Package size={14} /> In Stock</div>
                                        }
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button className="action-btn edit" title="Edit Product" onClick={() => openEdit(product)}><Edit size={18} /></button>
                                            <button className="action-btn cancel" title="Delete Product" onClick={() => handleDelete(product)}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="empty-state">
                            <Package size={48} />
                            <p>{searchTerm ? 'No products match your search.' : 'No products yet. Click "New Product" to add one.'}</p>
                        </div>
                    )}
                </div>
            </AnimatedCard>

            <AnimatePresence>
                {modalOpen && <ProductModal product={editProduct} onClose={closeModal} onSaved={handleSaved} />}
            </AnimatePresence>

            <style>{`
                .product-modal { width: 100%; max-width: 600px; padding: 2rem; border-radius: 24px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { font-size: 1.5rem; }
                .close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px; cursor: pointer; color: var(--text-dim); display: flex; }
                .close-btn:hover { background: rgba(255,255,255,0.1); }
                .product-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
                .form-group input, .form-group select, .form-group textarea { background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 10px; padding: 0.65rem 1rem; color: var(--text-main); font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: hsl(var(--primary)); }
                .form-group select option { background: #1e1b4b; }
                .form-group textarea { resize: vertical; font-family: inherit; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
            `}</style>
        </motion.div>
    );
};

export default Products;
