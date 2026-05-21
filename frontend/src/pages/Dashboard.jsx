import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users as UsersIcon,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Package,
  Truck,
  AlertCircle,
  ArrowRight,
  Building2,
  Zap,
  BarChart3,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import api from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../websocket/orderSocket';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../components/ui/AnimatedCard';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, itemFadeIn } from '../animations/fadeAnimation';
import { MOCK_ANALYTICS_SUMMARY, MOCK_ORDERS, MOCK_CUSTOMERS } from '../services/mockData';
import './Dashboard.css';

const MOCK_REVENUE_DATA = [
  { name: 'Mon', revenue: 12400, orders: 8 },
  { name: 'Tue', revenue: 18200, orders: 12 },
  { name: 'Wed', revenue: 9800, orders: 6 },
  { name: 'Thu', revenue: 24600, orders: 16 },
  { name: 'Fri', revenue: 31200, orders: 21 },
  { name: 'Sat', revenue: 22100, orders: 14 },
  { name: 'Sun', revenue: 17900, orders: 11 },
];

const MOCK_STATUS_COUNTS = [
  { name: 'PENDING', value: 18 },
  { name: 'SHIPPED', value: 24 },
  { name: 'DELIVERED', value: 31 },
  { name: 'CANCELLED', value: 5 },
];

const MOCK_TOP_CUSTOMERS = [
  { customerName: 'Anjali Mehta', orderCount: 22, totalSpent: 91400 },
  { customerName: 'Kiran Reddy', orderCount: 19, totalSpent: 68000 },
  { customerName: 'Priya Sharma', orderCount: 14, totalSpent: 42800 },
  { customerName: 'Deepika Singh', orderCount: 11, totalSpent: 33500 },
  { customerName: 'Rahul Verma', orderCount: 7, totalSpent: 18600 },
];

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#22c55e'];

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [statusCounts, setStatusCounts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orgInfo, setOrgInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
    fetchOrgInfo();

    connectWebSocket((newOrder) => {
      const newActivity = {
        id: Date.now(),
        type: 'new-order',
        message: `New order #${newOrder.id.slice(-6).toUpperCase()} by ${newOrder.customerName}`,
        time: 'Just now',
        amount: newOrder.totalAmount
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 8));
      fetchDashboardData(false);
    });

    return () => disconnectWebSocket();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const res = await api.get('/analytics/revenue-trend');
      setRevenueData(res.data?.length > 0 ? res.data : MOCK_REVENUE_DATA);
    } catch (err) {
      setRevenueData(MOCK_REVENUE_DATA);
    }
  };

  const fetchOrgInfo = async () => {
    try {
      const res = await api.get('/organizations/my');
      if (res.data?.hasOrg) setOrgInfo(res.data.organization);
    } catch (err) { /* silent */ }
  };

  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [summaryRes, statusRes, topRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/sales-by-status'),
        api.get('/analytics/top-customers')
      ]);

      setSummary(summaryRes.data);

      const rawStatus = statusRes.data;
      const formattedStatus = Array.isArray(rawStatus)
        ? rawStatus
        : Object.entries(rawStatus || {}).map(([name, value]) => ({ name, value }));
      setStatusCounts(formattedStatus.length > 0 ? formattedStatus : MOCK_STATUS_COUNTS);

      setTopCustomers(topRes.data?.length > 0 ? topRes.data : MOCK_TOP_CUSTOMERS);
    } catch (error) {
      console.warn("Dashboard data fetch failed, using demo data", error);
      setSummary(MOCK_ANALYTICS_SUMMARY);
      setStatusCounts(MOCK_STATUS_COUNTS);
      setTopCustomers(MOCK_TOP_CUSTOMERS);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(false), fetchRevenueData()]);
    setRefreshing(false);
  };

  const COLORS = useMemo(() => ['#fbbf24', '#5eead4', '#6366f1', '#22c55e', '#ef4444'], []);

  const greetingText = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading) return <Loader size="lg" />;

  return (
    <motion.div
      className="dashboard-page-v3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <header className="dash-header-v3">
        <div className="dash-header-left">
          <motion.h1
            className="outfit dash-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {greetingText}, {user?.name || user?.username}
          </motion.h1>
          <p className="dash-subtitle">
            Here's what's happening with your business today
            {orgInfo ? ` at ${orgInfo.name}` : ''}
          </p>
        </div>
        <div className="dash-header-right">
          {!user?.organizationId && (
            <motion.button
              className="workspace-btn"
              onClick={() => navigate('/onboarding')}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Building2 size={16} /> Set Up Workspace <ArrowRight size={14} />
            </motion.button>
          )}
          <motion.button
            className="refresh-btn glass"
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
          </motion.button>
          <div className="date-badge glass">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid-v3">
        <StatsCard
          label={t('total_revenue')}
          value={`₹${summary?.totalRevenue?.toLocaleString() || '0'}`}
          trend={summary?.totalOrders > 0 ? `${summary.totalOrders} orders` : 'No data yet'}
          up={summary?.totalRevenue > 0}
          icon={<DollarSign />}
          variant="revenue"
          color="#6366f1"
          delay={0}
        />
        <StatsCard
          label={t('orders')}
          value={summary?.totalOrders || 0}
          trend={`${summary?.pendingOrders || 0} pending`}
          up={summary?.totalOrders > 0}
          icon={<ShoppingBag />}
          variant="orders"
          color="#22c55e"
          delay={0.05}
        />
        <StatsCard
          label={t('customers')}
          value={summary?.totalCustomers || 0}
          trend={`${summary?.totalProducts || 0} products`}
          up={summary?.totalCustomers > 0}
          icon={<UsersIcon />}
          variant="customers"
          color="#f59e0b"
          delay={0.1}
        />
        <StatsCard
          label="Avg Order Value"
          value={`₹${summary?.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders).toLocaleString() : '0'}`}
          trend={summary?.totalOrders > 0 ? 'Per order' : 'No orders yet'}
          up={summary?.totalOrders > 0}
          icon={<TrendingUp />}
          variant="pending"
          color="#ec4899"
          delay={0.15}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-v3">
        {[
          { label: 'New Order', icon: <ShoppingBag size={18} />, path: '/orders', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
          { label: 'Add Product', icon: <Package size={18} />, path: '/products', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
          { label: 'View Shipments', icon: <Truck size={18} />, path: '/shipments', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Run Reports', icon: <BarChart3 size={18} />, path: '/reports', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
        ].map((action, i) => (
          <motion.button
            key={i}
            className="quick-action-btn"
            onClick={() => navigate(action.path)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ y: -4, boxShadow: `0 12px 28px ${action.color}18` }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="qa-icon" style={{ background: action.bg, color: action.color }}>
              {action.icon}
            </span>
            <span className="qa-label">{action.label}</span>
            <ArrowRight size={14} className="qa-arrow" />
          </motion.button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-v3">
        <AnimatedCard title={t('revenue_flow')} subtitle={t('last_7_days')} className="chart-card-v3 area-chart">
          <div className="chart-container-v3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.35)', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: '#fff', fontSize: '0.875rem' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: 4 }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        <AnimatedCard title={t('order_distribution')} subtitle={t('by_status')} className="chart-card-v3 pie-chart">
          <div className="chart-container-v3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{
                     backgroundColor: 'rgba(15, 23, 42, 0.95)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: '12px',
                     boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                   }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend-v3">
             {statusCounts.map((entry, index) => (
               <div key={index} className="legend-item-v3">
                  <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="legend-label">{t(entry.name.toLowerCase())}</span>
                  <span className="legend-value">{entry.value}</span>
               </div>
             ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid-v3">
        <AnimatedCard title={t('top_customers')} subtitle={t('based_on_spend')} className="table-card-v3">
           <div className="top-customer-list-v3">
              {topCustomers.map((c, i) => (
                <motion.div
                  key={i}
                  className="customer-row-v3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                   <div className="c-rank">#{i + 1}</div>
                   <div className="c-avatar-v3" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                     {c?.customerName?.charAt(0) || 'U'}
                   </div>
                   <div className="c-details-v3">
                      <span className="c-name-v3">{c?.customerName || 'Unknown User'}</span>
                      <span className="c-orders-v3">{c?.orderCount || 0} {t('successful_orders')}</span>
                   </div>
                   <div className="c-amount-v3 outfit">₹{(c?.totalSpent || 0).toLocaleString()}</div>
                </motion.div>
              ))}
              {topCustomers.length === 0 && (
                <div className="empty-state-v3">
                  <UsersIcon size={28} opacity={0.2} />
                  <p>{t('waiting_data')}</p>
                </div>
              )}
           </div>
        </AnimatedCard>

        <AnimatedCard title={t('activity_feed')} subtitle={t('real_time_sync')} className="activity-card-v3">
            <div className="activity-feed-v3">
               <AnimatePresence>
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      className="activity-row-v3"
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                       <div className={`activity-icon-v3 ${activity.type}`}>
                          <Activity size={15} />
                       </div>
                       <div className="activity-info-v3">
                          <p>{activity.message}</p>
                          <span className="activity-time">
                            <Clock size={11} />
                            {t(activity.time.toLowerCase().replace(' ', '_'))}
                          </span>
                       </div>
                       {activity.amount && (
                         <span className="activity-amount">₹{activity.amount.toLocaleString()}</span>
                       )}
                    </motion.div>
                  ))}
               </AnimatePresence>
               {activities.length === 0 && (
                 <div className="empty-state-v3 activity-empty">
                    <div className="empty-icon-pulse">
                      <Zap size={28} />
                    </div>
                    <p>No recent activity</p>
                    <span>Activities will appear here in real-time as orders are placed</span>
                 </div>
               )}
            </div>
        </AnimatedCard>
      </div>
    </motion.div>
  );
};

const StatsCard = ({ label, value, trend, up, icon, variant, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <AnimatedCard className={`stat-card-v3 ${variant}`}>
       <div className="stat-glow" style={{ background: color }}></div>
       <div className="stat-top-v3">
          <div className="stat-icon-v3" style={{ background: `${color}14`, color, borderColor: `${color}20` }}>
            {icon}
          </div>
          <div className={`trend-badge-v3 ${up ? 'up' : 'down'}`}>
             {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
             <span>{trend}</span>
          </div>
       </div>
       <div className="stat-bottom-v3">
          <h3 className="outfit">{value || '0'}</h3>
          <p>{label}</p>
       </div>
    </AnimatedCard>
  </motion.div>
);

export default Dashboard;
