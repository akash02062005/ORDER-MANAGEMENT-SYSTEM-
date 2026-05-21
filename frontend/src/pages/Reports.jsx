import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BarChart3, DollarSign, Users, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Reports.css';

const templates = [
  { id: 'sales', name: 'Sales Report', desc: 'Revenue breakdown by product, category and date', icon: <DollarSign />, color: '#10b981' },
  { id: 'customers', name: 'Customer Report', desc: 'Top customers, LTV, churn and segmentation', icon: <Users />, color: '#6366f1' },
  { id: 'inventory', name: 'Inventory Report', desc: 'Stock levels, reorder suggestions and valuation', icon: <Package />, color: '#f59e0b' },
  { id: 'tax', name: 'Tax Report', desc: 'GST/VAT summary for filing', icon: <FileText />, color: '#ec4899' },
  { id: 'performance', name: 'Performance Report', desc: 'KPIs, goals and trends', icon: <BarChart3 />, color: '#06b6d4' },
  { id: 'payments', name: 'Payments Report', desc: 'Transaction history and reconciliation', icon: <DollarSign />, color: '#8b5cf6' },
];

const Reports = () => {
  const [generating, setGenerating] = useState(null);
  const [history, setHistory] = useState([
    { id: 1, name: 'Sales Report - March 2026', date: '2026-04-01', size: '142 KB', format: 'CSV' },
    { id: 2, name: 'Tax Report - Q1 2026', date: '2026-04-05', size: '89 KB', format: 'PDF' },
    { id: 3, name: 'Inventory - Week 14', date: '2026-04-08', size: '56 KB', format: 'XLSX' },
  ]);

  const generate = (tpl) => {
    setGenerating(tpl.id);
    setTimeout(() => {
      const entry = { id: Date.now(), name: `${tpl.name} - ${new Date().toLocaleDateString()}`, date: new Date().toISOString().slice(0, 10), size: `${Math.floor(50 + Math.random() * 200)} KB`, format: 'CSV' };
      setHistory(h => [entry, ...h]);
      setGenerating(null);
      const content = `Report: ${tpl.name}\nGenerated: ${new Date().toISOString()}\n\nDate,Revenue,Orders,Customers\n2026-04-01,45200,142,98\n2026-04-02,38100,118,82\n2026-04-03,52800,165,113`;
      const blob = new Blob([content], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `${tpl.id}-report.csv`; a.click();
      toast.success(`${tpl.name} generated`);
    }, 1200);
  };

  return (
    <motion.div className="reports-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Reports Center</h1>
          <p>Generate and schedule business reports</p>
        </div>
      </header>

      <div className="templates-grid">
        {templates.map((t, i) => (
          <motion.div key={t.id} className="tpl-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -6 }}>
            <div className="tpl-icon" style={{ background: `${t.color}22`, color: t.color }}>{t.icon}</div>
            <h4>{t.name}</h4>
            <p>{t.desc}</p>
            <button className="gen-btn" disabled={generating === t.id} onClick={() => generate(t)}>
              {generating === t.id ? <>Generating...</> : <><Download size={14} /> Generate</>}
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatedCard title="Recent Reports" subtitle="Downloaded in the last 30 days" className="hist-card">
        <div className="hist-list">
          {history.map(h => (
            <motion.div key={h.id} className="hist-row" whileHover={{ x: 4 }}>
              <div className="h-icon"><FileText size={18} /></div>
              <div className="h-info">
                <b>{h.name}</b>
                <span>{h.date} · {h.size}</span>
              </div>
              <span className="format-tag">{h.format}</span>
              <button className="dl-btn"><Download size={14} /></button>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default Reports;
