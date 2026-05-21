import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Settings, HelpCircle,
  Diamond, LogOut, CreditCard, BarChart3, FileText, Warehouse, UserCog,
  Puzzle, Sparkles, Truck, Tag, FileBarChart, History, Shield,
  ArrowRight, Crown, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = () => {
  const { user, isAdmin, isManager, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentPlan = user?.subscription || 'FREE';

  return (
    <aside className="sidebar-v3">
      <div className="sidebar-logo-v3">
        <div className="logo-glow-v3"></div>
        <div className="logo-icon-v3 outfit">OS</div>
        <span className="logo-text-v3 outfit">OrderStream<span className="logo-dot-v3">.</span></span>
      </div>

      <nav className="sidebar-nav-v3">
        <div className="nav-group-v3">
          <p className="nav-label-v3">{t('general')}</p>
          <NavLink to="/" end className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /><span>{t('dashboard')}</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} /><span>Analytics</span>
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} /><span>AI Insights</span>
            <span className="nav-badge-v3 new">NEW</span>
          </NavLink>
        </div>

        <div className="nav-group-v3">
          <p className="nav-label-v3">Commerce</p>
          <NavLink to="/orders" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={18} /><span>{t('orders')}</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Package size={18} /><span>{t('inventory')}</span>
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Warehouse size={18} /><span>Stock</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Users size={18} /><span>{t('customers')}</span>
          </NavLink>
          <NavLink to="/shipments" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Truck size={18} /><span>Shipments</span>
          </NavLink>
          <NavLink to="/discounts" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Tag size={18} /><span>Discounts</span>
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <FileText size={18} /><span>Invoices</span>
          </NavLink>
        </div>

        <div className="nav-group-v3">
          <p className="nav-label-v3">Workspace</p>
          <NavLink to="/reports" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <FileBarChart size={18} /><span>Reports</span>
          </NavLink>
          <NavLink to="/team" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <UserCog size={18} /><span>Team</span>
          </NavLink>
          <NavLink to="/integrations" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Puzzle size={18} /><span>Integrations</span>
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <History size={18} /><span>Activity Log</span>
          </NavLink>
          <NavLink to="/saas-admin" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Shield size={18} /><span>SaaS Admin</span>
            <span className="nav-badge-v3 pro">PRO</span>
          </NavLink>
        </div>

        <div className="nav-group-v3 secondary">
          <p className="nav-label-v3">{t('system')}</p>
          <NavLink to="/billing" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <CreditCard size={18} /><span>Billing</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <Settings size={18} /><span>{t('settings')}</span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `nav-link-v3 ${isActive ? 'active' : ''}`}>
            <HelpCircle size={18} /><span>{t('help')}</span>
          </NavLink>
        </div>
      </nav>

      {/* Upgrade CTA for free users */}
      {currentPlan === 'FREE' && (
        <motion.div
          className="upgrade-cta-v3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="upgrade-cta-glow"></div>
          <div className="upgrade-cta-icon">
            <Crown size={18} />
          </div>
          <p className="upgrade-cta-title">Unlock Pro Features</p>
          <p className="upgrade-cta-desc">Get unlimited orders, AI insights & priority support</p>
          <button className="upgrade-cta-btn" onClick={() => navigate('/pricing')}>
            <Zap size={14} /> Upgrade Now <ArrowRight size={13} />
          </button>
        </motion.div>
      )}

      <div className="sidebar-footer-v3">
        <div className="sidebar-user-v3">
          <div className="su-avatar">
            {(user?.name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="su-info">
            <p className="su-name">{user?.name || user?.username || 'User'}</p>
            <span className={`su-plan ${currentPlan.toLowerCase()}`}>{currentPlan} Plan</span>
          </div>
        </div>
        <button className="logout-btn-v3" onClick={logout} title={t('logout')}>
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
