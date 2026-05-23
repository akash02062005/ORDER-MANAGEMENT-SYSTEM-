import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Package, Clock, CheckCircle, Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import api from '../services/api';
import AnimatedCard from '../components/ui/AnimatedCard';
import './Shipments.css';

const STAGES = ['PICKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const progressOf = stage => ({ PICKED: 20, IN_TRANSIT: 50, OUT_FOR_DELIVERY: 85, DELIVERED: 100 }[stage] || 20);
const POLL_INTERVAL_MS = 20000;
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [updating, setUpdating] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const stompRef = useRef(null);
  const pollRef = useRef(null);

  // Merge an incoming shipment update (insert or replace by id)
  const upsertShipment = useCallback((incoming) => {
    if (!incoming || !incoming.id) return;
    setShipments(prev => {
      const idx = prev.findIndex(s => s.id === incoming.id);
      if (idx === -1) return [incoming, ...prev];
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...incoming };
      return copy;
    });
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/shipments');
      setShipments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (!silent) toast.error('Failed to load shipments');
      // Don't fall back to mock data — show the real empty state instead of fake counts.
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // WebSocket — real-time shipment updates
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true);
        client.subscribe('/topic/shipments', (msg) => {
          try {
            const ship = JSON.parse(msg.body);
            upsertShipment(ship);
          } catch (e) {
            console.warn('Shipments WS parse error', e);
          }
        });
      },
      onDisconnect: () => setWsConnected(false),
      onWebSocketError: () => setWsConnected(false),
      onStompError: () => setWsConnected(false),
    });
    stompRef.current = client;
    try { client.activate(); } catch { /* ignore */ }

    return () => {
      try { client.deactivate(); } catch { /* ignore */ }
      stompRef.current = null;
    };
  }, [upsertShipment]);

  // Polling fallback — fires every 20s; silent (no spinner/toasts) and only when WS is down.
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (!wsConnected) load({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [wsConnected, load]);

  // Refresh on window focus (tab regains visibility)
  useEffect(() => {
    const onFocus = () => load({ silent: true });
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  const updateStage = async (id, stage) => {
    try {
      setUpdating(id);
      const res = await api.post(`/shipments/${id}/stage`, { stage });
      // Optimistic update; the WS broadcast will reconcile shortly.
      upsertShipment(res.data || { id, stage, progress: progressOf(stage) });
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

  // Stats are derived from the *real* shipments list (no mock data).
  const statsList = [
    { label: 'Total', value: shipments.length, icon: <Package />, color: '#6366f1' },
    { label: 'In Transit', value: shipments.filter(s => s.stage === 'IN_TRANSIT').length, icon: <Truck />, color: '#3b82f6' },
    { label: 'Out for Delivery', value: shipments.filter(s => s.stage === 'OUT_FOR_DELIVERY').length, icon: <Package />, color: '#f59e0b' },
    { label: 'Delivered', value: shipments.filter(s => s.stage === 'DELIVERED').length, icon: <CheckCircle />, color: '#10b981' },
    { label: 'Pending', value: shipments.filter(s => s.stage === 'PICKED').length, icon: <Clock />, color: '#ec4899' },
  ];

  return (
    <motion.div className="ship-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Shipments</h1>
          <p>
            Live tracking across all carriers&nbsp;
            <span title={wsConnected ? 'Real-time updates active' : 'Polling fallback (WS offline)'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: wsConnected ? '#10b981' : '#9ca3af' }}>
              {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {wsConnected ? 'live' : 'offline'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box glass">
            <Search size={16} />
            <input placeholder="Search tracking, order or carrier..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn-ghost" onClick={() => load()} title="Refresh" style={{ padding: '8px 12px' }}>
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
            <p style={{ marginTop: '12px' }}>{q ? 'No shipments match your search.' : 'No shipments yet. Place an order and one will appear here automatically.'}</p>
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
                transition={{ delay: Math.min(i, 10) * 0.04 }}
                whileHover={{ y: -4 }}>
                <div className="ship-head">
                  <div>
                    <b className="mono">{s.trackingNumber || 'TRK-' + (s.id || '').slice(-6).toUpperCase()}</b>
                    <span>{s.orderId ? '#' + s.orderId.slice(-6).toUpperCase() : 'No order'} &middot; {s.carrier || 'Unknown'}</span>
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
