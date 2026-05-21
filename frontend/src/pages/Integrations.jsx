import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ExternalLink, Zap, Puzzle } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Integrations.css';

const catalog = [
  { id: 'razorpay', name: 'Razorpay', desc: 'UPI, cards and netbanking payments', cat: 'Payments', color: '#072654', icon: '🇮🇳' },
  { id: 'shopify', name: 'Shopify', desc: 'Sync products, orders and customers', cat: 'Commerce', color: '#96bf47', icon: '🛍️' },
  { id: 'slack', name: 'Slack', desc: 'Order alerts in your team channels', cat: 'Messaging', color: '#4a154b', icon: '💬' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS OTP and transactional messages', cat: 'Messaging', color: '#f22f46', icon: '📱' },
  { id: 'sendgrid', name: 'SendGrid', desc: 'Transactional and marketing email', cat: 'Messaging', color: '#1a82e2', icon: '📧' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Backup invoices and reports', cat: 'Storage', color: '#4285f4', icon: '📁' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Sync accounting and invoices', cat: 'Accounting', color: '#2ca01c', icon: '📊' },
  { id: 'zapier', name: 'Zapier', desc: 'Connect to 5000+ other apps', cat: 'Automation', color: '#ff4a00', icon: '⚡' },
  { id: 'mailchimp', name: 'Mailchimp', desc: 'Marketing automation and campaigns', cat: 'Marketing', color: '#ffe01b', icon: '🐵' },
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM sync for contacts and deals', cat: 'CRM', color: '#ff7a59', icon: '🎯' },
  { id: 'shipstation', name: 'ShipStation', desc: 'Multi-carrier shipping and labels', cat: 'Shipping', color: '#0074c8', icon: '📦' },
];

const cats = ['All', 'Payments', 'Commerce', 'Messaging', 'Storage', 'Accounting', 'Automation', 'Marketing', 'CRM', 'Shipping'];

const Integrations = () => {
  const [connected, setConnected] = useState(['razorpay', 'slack']);
  const [filter, setFilter] = useState('All');

  const toggle = (id) => {
    if (connected.includes(id)) {
      setConnected(connected.filter(c => c !== id));
      toast.info(`Disconnected from ${catalog.find(c => c.id === id).name}`);
    } else {
      setConnected([...connected, id]);
      toast.success(`Connected to ${catalog.find(c => c.id === id).name}`);
    }
  };

  const filtered = filter === 'All' ? catalog : catalog.filter(c => c.cat === filter);

  return (
    <motion.div className="integrations-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Integrations Marketplace</h1>
          <p>Connect your favourite tools with a single click</p>
        </div>
        <div className="stats-pill glass"><Zap size={14} /> {connected.length} connected</div>
      </header>

      <div className="cat-filter">
        {cats.map(c => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="int-grid">
        {filtered.map((item, i) => {
          const isConnected = connected.includes(item.id);
          return (
            <motion.div key={item.id} className="int-card glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px ${item.color}33` }}>
              <div className="int-icon" style={{ background: `${item.color}22` }}>{item.icon}</div>
              <h4>{item.name}</h4>
              <p>{item.desc}</p>
              <span className="cat-tag">{item.cat}</span>
              <button className={`int-btn ${isConnected ? 'connected' : ''}`} onClick={() => toggle(item.id)}>
                {isConnected ? <><Check size={14} /> Connected</> : <>Connect</>}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Integrations;
