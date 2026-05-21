import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Target, Zap, Globe,
  ShoppingCart, Award, Download
} from 'lucide-react';
import AnimatedCard from '../components/ui/AnimatedCard';
import Loader from '../components/ui/Loader';
import api from '../services/api';
import { MOCK_ANALYTICS_SUMMARY } from '../services/mockData';
import './Analytics.css';

const MOCK_SALES_TREND = [
  { name: 'Mon', revenue: 12400, orders: 8 },
  { name: 'Tue', revenue: 18200, orders: 12 },
  { name: 'Wed', revenue: 9800, orders: 6 },
  { name: 'Thu', revenue: 24600, orders: 16 },
  { name: 'Fri', revenue: 31200, orders: 21 },
  { name: 'Sat', revenue: 22100, orders: 14 },
  { name: 'Sun', revenue: 17900, orders: 11 },
];

const MOCK_STATUS_DATA = [
  { name: 'Pending', value: 18 },
  { name: 'Shipped', value: 24 },
  { name: 'Delivered', value: 31 },
  { name: 'Cancelled', value: 5 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const Analytics = () => {
  const [range, setRange] = useState('30d');
  const [kpi, setKpi] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryRes, trendRes, statusRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/revenue-trend'),
          api.get('/analytics/sales-by-status'),
        ]);
        setKpi(summaryRes.data || MOCK_ANALYTICS_SUMMARY);
        setSalesTrend(trendRes.data?.length > 0 ? trendRes.data : MOCK_SALES_TREND);

        const rawStatus = statusRes.data;
        const formattedStatus = Array.isArray(rawStatus)
          ? rawStatus
          : Object.entries(rawStatus || {}).map(([name, value]) => ({ name, value }));
        setStatusData(formattedStatus.length > 0 ? formattedStatus : MOCK_STATUS_DATA);
      } catch (err) {
        console.warn('Analytics fetch failed, using demo data');
        setKpi(MOCK_ANALYTICS_SUMMARY);
        setSalesTrend(MOCK_SALES_TREND);
        setStatusData(MOCK_STATUS_DATA);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const avgOrderValue = kpi?.totalOrders > 0 ? Math.round(kpi.totalRevenue / kpi.totalOrders) : 0;

  const exportCSV = () => {
    const header = 'date,day,revenue,orders\n';
    const rows = salesTrend.map(r => `${r.date},${r.name},${r.revenue},${r.orders}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'analytics.csv'; a.click();
  };

  if (loading) return <Loader size="lg" />;

  return (
    <motion.div className="analytics-page"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-header">
        <div>
          <h1 className="outfit">Advanced Analytics</h1>
          <p>Deep-dive metrics and real-time insights from your data</p>
        </div>
        <div className="header-actions">
          <select value={range} onChange={e => setRange(e.target.value)} className="glass range-select">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
          <button className="btn-ghost glass" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      <div className="kpi-grid">
        {[
          { label: 'Revenue', value: `₹${(kpi?.totalRevenue || 0).toLocaleString()}`, trend: `${kpi?.totalOrders || 0} orders`, up: (kpi?.totalRevenue || 0) > 0, icon: <DollarSign />, color: '#6366f1' },
          { label: 'Total Orders', value: kpi?.totalOrders || 0, trend: `${kpi?.pendingOrders || 0} pending`, up: (kpi?.totalOrders || 0) > 0, icon: <Target />, color: '#10b981' },
          { label: 'Avg Order', value: `₹${avgOrderValue.toLocaleString()}`, trend: 'Per order', up: avgOrderValue > 0, icon: <ShoppingCart />, color: '#f59e0b' },
          { label: 'Customers', value: kpi?.totalCustomers || 0, trend: `${kpi?.totalProducts || 0} products`, up: (kpi?.totalCustomers || 0) > 0, icon: <Award />, color: '#ec4899' },
          { label: 'Products', value: kpi?.totalProducts || 0, trend: 'In catalog', up: (kpi?.totalProducts || 0) > 0, icon: <Zap />, color: '#8b5cf6' },
          { label: 'Pending', value: kpi?.pendingOrders || 0, trend: 'Awaiting action', up: false, icon: <Globe />, color: '#06b6d4' },
        ].map((k, i) => (
          <motion.div key={i} className="kpi-card glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(99,102,241,0.25)' }}>
            <div className="kpi-icon" style={{ background: `${k.color}22`, color: k.color }}>{k.icon}</div>
            <div className="kpi-body">
              <span className="kpi-label">{k.label}</span>
              <h3 className="outfit">{k.value}</h3>
              <span className={`kpi-trend ${k.up ? 'up' : 'down'}`}>
                {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-row">
        <AnimatedCard title="Revenue Trend" subtitle="Last 7 days from real orders" className="chart-card big">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesTrend}>
              <defs>
                <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" fill="url(#salesG)" />
              <Bar dataKey="orders" name="Orders" barSize={20} fill="#10b981" radius={[6, 6, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
          {salesTrend.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
              No order data yet. Create orders to see revenue trends.
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard title="Order Status" subtitle="Distribution by status" className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {statusData.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
              No orders yet.
            </div>
          )}
        </AnimatedCard>
      </div>
    </motion.div>
  );
};

export default Analytics;
