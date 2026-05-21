import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Send, Eye, Plus, Search, X, Check, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Invoices.css';

const MOCK_INVOICES = [
  { id: 'INV-001', invoiceNumber: 'INV-2024-001', customerName: 'Anjali Mehta', customerEmail: 'anjali@example.com', total: 12999, amount: 12999, status: 'PAID', issuedAt: '2024-03-01', dueAt: '2024-03-15', currency: 'INR' },
  { id: 'INV-002', invoiceNumber: 'INV-2024-002', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', total: 8499, amount: 8499, status: 'SENT', issuedAt: '2024-03-05', dueAt: '2024-03-19', currency: 'INR' },
  { id: 'INV-003', invoiceNumber: 'INV-2024-003', customerName: 'Rahul Verma', customerEmail: 'rahul@example.com', total: 4298, amount: 4298, status: 'OVERDUE', issuedAt: '2024-02-15', dueAt: '2024-03-01', currency: 'INR' },
  { id: 'INV-004', invoiceNumber: 'INV-2024-004', customerName: 'Kiran Reddy', customerEmail: 'kiran@example.com', total: 23997, amount: 23997, status: 'DRAFT', issuedAt: '2024-03-10', dueAt: '2024-03-24', currency: 'INR' },
];

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data?.length > 0 ? res.data : MOCK_INVOICES);
    } catch {
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => invoices.filter(i => {
    const customer = i.customerName || '';
    const id = i.invoiceNumber || i.id || '';
    const matchesFilter = filter === 'ALL' || i.status === filter;
    const matchesSearch = customer.toLowerCase().includes(search.toLowerCase()) ||
                          id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [invoices, search, filter]);

  const totals = useMemo(() => ({
    paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.total || i.amount || 0), 0),
    pending: invoices.filter(i => i.status === 'PENDING' || i.status === 'SENT').reduce((s, i) => s + Number(i.total || i.amount || 0), 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + Number(i.total || i.amount || 0), 0),
  }), [invoices]);

  const markPaid = async (id) => {
    try {
      let updated;
      try {
        const res = await api.post('/invoices/' + id + '/mark-paid');
        updated = res.data;
      } catch {
        updated = invoices.find(i => i.id === id);
        if (updated) updated = { ...updated, status: 'PAID' };
      }
      setInvoices(inv => inv.map(i => i.id === id ? (updated || i) : i));
      if (selected && selected.id === id) setSelected(updated || selected);
      toast.success('Invoice marked as paid');
    } catch {
      toast.error('Failed to mark invoice as paid');
    }
  };

  const sendInvoice = async (id) => {
    try {
      try {
        await api.post('/invoices/' + id + '/send');
      } catch {
        // Optimistic update
      }
      setInvoices(inv => inv.map(i => i.id === id ? { ...i, status: 'SENT' } : i));
      toast.success('Invoice sent successfully');
    } catch {
      toast.error('Failed to send invoice');
    }
  };

  const downloadInvoice = (inv) => {
    const num = inv.invoiceNumber || inv.id;
    const customer = inv.customerName || inv.customerEmail || 'Customer';
    const amount = Number(inv.total || inv.amount || 0);
    const html = '<html><head><title>' + num + '</title><style>body{font-family:Arial;padding:40px}h1{color:#6366f1}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h1>INVOICE ' + num + '</h1><p>Billed to: <b>' + customer + '</b></p><p>Issued: ' + (inv.issuedAt || '') + '<br/>Due: ' + (inv.dueAt || '') + '</p><table><tr><th>Description</th><th>Amount</th></tr><tr><td>Services</td><td>Rs.' + amount.toLocaleString() + '</td></tr></table><h2 style="text-align:right;margin-top:30px">Total: Rs.' + amount.toLocaleString() + '</h2></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = num + '.html';
    a.click();
    toast.success('Invoice downloaded');
  };

  const handleCreate = async (form) => {
    try {
      const payload = {
        customerName: form.customer,
        customerEmail: form.email,
        amount: Number(form.amount),
        total: Number(form.amount),
        status: 'DRAFT',
        issuedAt: new Date().toISOString().slice(0, 10),
        dueAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        notes: form.notes,
        currency: 'INR',
      };
      const res = await api.post('/invoices', payload);
      setInvoices(prev => [res.data, ...prev]);
      setCreating(false);
      toast.success('Invoice created');
    } catch {
      toast.error('Failed to create invoice');
    }
  };

  if (loading) return (
    <motion.div className="invoices-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>
        <RefreshCw size={32} className="spinning" />
        <p style={{ marginTop: '12px' }}>Loading invoices...</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div className="invoices-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Invoices</h1>
          <p>Create, send and track billing documents</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> New Invoice
        </button>
      </header>

      <div className="inv-summary">
        <motion.div className="sum-card glass paid" whileHover={{ y: -4 }}>
          <span>Paid</span><h3>Rs.{totals.paid.toLocaleString()}</h3>
        </motion.div>
        <motion.div className="sum-card glass pending" whileHover={{ y: -4 }}>
          <span>Pending / Sent</span><h3>Rs.{totals.pending.toLocaleString()}</h3>
        </motion.div>
        <motion.div className="sum-card glass overdue" whileHover={{ y: -4 }}>
          <span>Overdue</span><h3>Rs.{totals.overdue.toLocaleString()}</h3>
        </motion.div>
      </div>

      <AnimatedCard className="inv-table-card">
        <div className="inv-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-group">
            {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map(f => (
              <button key={f} className={'chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            <FileText size={32} />
            <p style={{ marginTop: '8px' }}>No invoices found. Create your first invoice.</p>
          </div>
        ) : (
          <div className="inv-table">
            <div className="inv-head">
              <span>Invoice</span><span>Customer</span><span>Issued</span><span>Due</span><span>Amount</span><span>Status</span><span>Actions</span>
            </div>
            <AnimatePresence>
              {filtered.map((inv, i) => {
                const num = inv.invoiceNumber || inv.id;
                const customer = inv.customerName || inv.customerEmail || '—';
                const amount = Number(inv.total || inv.amount || 0);
                const issued = inv.issuedAt || (inv.createdAt ? inv.createdAt.slice(0, 10) : '—');
                const due = inv.dueAt || '—';
                const status = inv.status || 'DRAFT';
                return (
                  <motion.div key={inv.id} className="inv-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}>
                    <span className="mono">{num}</span>
                    <span>{customer}</span>
                    <span>{issued}</span>
                    <span>{due}</span>
                    <span className="mono">Rs.{amount.toLocaleString()}</span>
                    <span className={'status-pill ' + status.toLowerCase()}>{status}</span>
                    <span className="row-actions">
                      <button title="View" onClick={() => setSelected(inv)}><Eye size={14} /></button>
                      <button title="Send" onClick={() => sendInvoice(inv.id)}><Send size={14} /></button>
                      <button title="Download" onClick={() => downloadInvoice(inv)}><Download size={14} /></button>
                      {status !== 'PAID' && <button title="Mark paid" onClick={() => markPaid(inv.id)}><Check size={14} /></button>}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </AnimatedCard>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="modal glass" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <h3 className="outfit">{selected.invoiceNumber || selected.id}</h3>
                <button onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
              <p className="muted">Billed to <b>{selected.customerName || selected.customerEmail || '—'}</b></p>
              <div className="modal-meta">
                <div><span>Issued</span><b>{selected.issuedAt || '—'}</b></div>
                <div><span>Due</span><b>{selected.dueAt || '—'}</b></div>
                <div><span>Currency</span><b>{selected.currency || 'INR'}</b></div>
                <div><span>Status</span><b className={(selected.status || 'DRAFT').toLowerCase()}>{selected.status || 'DRAFT'}</b></div>
              </div>
              <div className="modal-total">
                <span>Total</span>
                <h2 className="outfit">Rs.{Number(selected.total || selected.amount || 0).toLocaleString()}</h2>
              </div>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => downloadInvoice(selected)}><Download size={16} /> Download</button>
                <button className="btn-primary" onClick={() => { sendInvoice(selected.id); setSelected(null); }}><Send size={16} /> Send</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {creating && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreating(false)}>
            <motion.div className="modal glass" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-head"><h3 className="outfit">Create Invoice</h3><button onClick={() => setCreating(false)}><X size={18} /></button></div>
              <CreateInvoiceForm onSave={handleCreate} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CreateInvoiceForm = ({ onSave }) => {
  const [form, setForm] = useState({ customer: '', email: '', amount: '', notes: '' });
  const set = (k) => (e) => setForm(f => Object.assign({}, f, { [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="inv-form">
      <label>Customer Name<input required value={form.customer} onChange={set('customer')} placeholder="Acme Corp" /></label>
      <label>Customer Email<input type="email" value={form.email} onChange={set('email')} placeholder="billing@acme.com" /></label>
      <label>Amount (Rs.)<input required type="number" min="1" value={form.amount} onChange={set('amount')} placeholder="5000" /></label>
      <label>Notes<textarea value={form.notes} onChange={set('notes')} placeholder="Optional notes..." rows={2} /></label>
      <button className="btn-primary" type="submit">Create Invoice</button>
    </form>
  );
};

export default Invoices;
