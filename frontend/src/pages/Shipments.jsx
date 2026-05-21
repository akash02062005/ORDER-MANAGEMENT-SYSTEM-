import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Package, Clock, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Shipments.css';

const MOCK_SHIPMENTS = [
  { id: 'shp001', trackingNumber: 'TRK-A12345', orderId: 'ORD-001', carrier: 'BlueDart', stage: 'IN_TRANSIT', originCity: 'Mumbai', destinationCity: 'Delhi', eta: 'Tomorrow', progress: 50 },
  { id: 'shp002', trackingNumber: 'TRK-B67890', orderId: 'ORD-002', carrier: 'Delhivery', stage: 'OUT_FOR_DELIVERY', originCity: 'Bangalore', destinationCity: 'Chennai', eta: 'Today', progress: 85 },
  { id: 'shp003', trackingNumber: 'TRK-C11223', orderId: 'ORD-003', carrier: 'DTDC', stage: 'DELIVERED', originCity: 'Delhi', destinationCity: 'Hyderabad', eta: 'Delivered', progress: 100 },
  { id: 'shp004', trackingNumber: 'TRK-D44556', orderId: 'ORD-004', carrier: 'FedEx', stage: 'PICKED', originCity: 'Kolkata', destinationCity: 'Pune', eta: '2 days', progress: 20 },
];

const STAGES = ['PICKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const progressOf = stage => ({ PICKED: 20, IN_TRANSIT: 50, OUT_FOR_DELIVERY: 85, DELIVERED: 100 }[stage] || 20);

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments');
      setShipments(res.data?.length > 0 ? res.data : MOCK_SHIPMENTS);
    } catch {
      setShipments(MOCK_SHIPMENTS);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id, stage) => {
    try {
      setUpdating(id);
      try {
        const res = await api.post(`/shipments/${id}/stage`, { stage });
        setShipments(prev => prev.map(s => s.id === id ? res.data : s));
      } catch {
        // Optimistic update if backend is offline
        const stageProgress = { PICKED: 20, IN_TRANSIT: 50, OUT_FOR_DELIVERY: 85, DELIVERED: 100 };
        setShipments(prev => prev.map(s => s.id === id ? { ...s, stage, progress: stageProgress[stage] || 20 } : s));
      }
      toast.success(`Shipment moved to ${stage.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update shipment stage');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(() => shipments.filter(s =>
    (s.trackingNumber || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.orderId || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.carrier || '').toLowerCase().includes(q.toLowerCase())
  ), [shipments, q]);

  const statsList = [
    { label: 'In Transit', value: shipments.filter(s => s.stage === 'IN_TRANSIT').length, icon: <Truck />, color: '#6366f1' },
    { label: 'Out for Delivery', value: shipments.filter(s => s.stage === 'OUT_FOR_DELIVERY').length, icon: <Package />, color: '#f59e0b' },
    { label: 'Delivered', value: shipments.filter(s => s.stage === 'DELIVERED').length, icon: <CheckCircle />, color: '#10b981' },
    { label: 'Pending', value: shipments.filter(s => s.stage === 'PICKED').length, icon: <Clock />, color: '#ec4899' },
  ];

  return (
    <motion.div className="ship-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Shipments</h1>
          <p>Live tracking across all carriers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box glass">
            <Search size={16} />
            <input placeholder="Search tracking, order or carrier..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn-ghost" onClick={load} title="Refresh" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      <div className="ship-stats">
        {statsList.map((s, i) => (
          <motion.div key={i} className="sstat glass" whileHover={{ y: -4 }}>
            <div className="si" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div><span>{s.label}</span><h3 className="outfit">{s.value}</h3></div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <AnimatedCard>
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
            <Truck size={40} />
            <p style={{ marginTop: '12px' }}>Loading shipments...</p>
          </div>
        </AnimatedCard>
      ) : filtered.length === 0 ? (
        <AnimatedCard>
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
            <Package size={40} />
            <p style={{ marginTop: '12px' }}>{q ? 'No shipments match your search.' : 'No shipments yet. They appear here once orders are fulfilled.'}</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="ship-grid">
          {filtered.map((s, i) => {
            const progress = s.progress != null ? s.progress : progressOf(s.stage);
            const currentIdx = STAGES.indexOf(s.stage);
            const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;
            const stageCss = (s.stage || 'PICKED').toLowerCase().replace(/_/g, '-');
            return (
              <motion.div key={s.id} className="ship-card glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}>
                <div className="ship-head">
                  <div>
                    <b className="mono">{s.trackingNumber || 'TRK-' + (s.id || '').slice(-6).toUpperCase()}</b>
                    <span>{s.orderId || 'No order'} &middot; {s.carrier || 'Unknown'}</span>
                  </div>
                  <span className={'stage-pill ' + stageCss}>{(s.stage || 'PICKED').replace(/_/g, ' ')}</span>
                </div>
                <div className="route">
                  <div className="route-point"><MapPin size={14} /> <b>{s.originCity || 'Origin'}</b></div>
                  <div className="route-line">
                    <motion.div className="route-progress" initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 1 }} />
                    <motion.div className="truck-icon" initial={{ left: '0%' }} animate={{ left: progress + '%' }} transition={{ duration: 1 }}>
                      <Truck size={16} />
                    </motion.div>
                  </div>
                  <div className="route-point"><MapPin size={14} /> <b>{s.destinationCity || 'Destination'}</b></div>
                </div>
                <div className="ship-foot">
                  <span>ETA: <b>{s.eta || 'TBD'}</b></span>
                  {nextStage ? (
                    <button className="track-btn" disabled={updating === s.id} onClick={() => updateStage(s.id, nextStage)}>
                      {updating === s.id ? 'Updating...' : 'Mark ' + nextStage.replace(/_/g, ' ')}
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>Delivered</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Shipments;
