import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Search, Command, ChevronDown, Globe, LogOut, Settings, User, CreditCard, Crown, Zap, X, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationPanel from '../ui/NotificationPanel';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [bellShake, setBellShake] = useState(false);
    const userMenuRef = useRef(null);
    const langRef = useRef(null);
    const prevUnreadRef = useRef(0);

    const roleDisplay = user?.roles?.[0]?.replace('ROLE_', '').toLowerCase();
    const planBadge = user?.subscription || 'FREE';

    const DEMO_NOTIFICATIONS = [
        { id: 'n1', type: 'order', title: 'New Order Received', desc: 'Order #ORD001 from Priya Sharma — ₹8,499', time: '2 mins ago', read: false },
        { id: 'n2', type: 'user', title: 'New Customer Signed Up', desc: 'Kiran Reddy joined from Hyderabad', time: '1 hour ago', read: false },
        { id: 'n3', type: 'success', title: 'Payment Confirmed', desc: 'Order #ORD003 payment successful — ₹12,999', time: '3 hours ago', read: true },
        { id: 'n4', type: 'warning', title: 'Low Stock Alert', desc: 'Ergonomic Mouse has only 3 units left', time: '5 hours ago', read: true },
    ];

    const loadNotifications = useCallback(async () => {
        if (!user?.id && !user?.username) return;
        try {
            const userId = user.id || user.username;
            const { data } = await api.get(`/notifications/user/${userId}`);
            const list = Array.isArray(data) ? data : [];
            const finalList = list.length > 0 ? list : DEMO_NOTIFICATIONS;
            const newUnread = finalList.filter(n => !n.read).length;
            setNotifications(finalList);
            // Shake bell when new unread arrives
            if (newUnread > prevUnreadRef.current) {
                setBellShake(true);
                setTimeout(() => setBellShake(false), 600);
            }
            prevUnreadRef.current = newUnread;
            setUnreadCount(newUnread);
        } catch (err) {
            setNotifications(prev => prev.length === 0 ? DEMO_NOTIFICATIONS : prev);
            setUnreadCount(prev => prev === 0 ? DEMO_NOTIFICATIONS.filter(n => !n.read).length : prev);
        }
    }, [user]);

    useEffect(() => {
        loadNotifications();
        // Poll every 5s for faster notification delivery
        const interval = setInterval(loadNotifications, 5000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
            if (langRef.current && !langRef.current.contains(e.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            const userId = user?.id || user?.username;
            await api.post(`/notifications/user/${userId}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) { /* silent */ }
    };

    const toggleLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangOpen(false);
    };

    const langNames = {
        en: { label: 'English', flag: '🇺🇸' },
        hi: { label: 'हिंदी', flag: '🇮🇳' },
        ta: { label: 'தமிழ்', flag: '🇮🇳' },
        te: { label: 'తెలుగు', flag: '🇮🇳' },
        bn: { label: 'বাংলা', flag: '🇮🇳' },
    };

    const currentLang = langNames[i18n.language] || langNames.en;

    return (
        <nav className="navbar-v3">
            <div className="navbar-left">
                <div className="search-wrapper-v3">
                    <Search size={17} className="search-icon" />
                    <input type="text" placeholder={`${t('search') || 'Search'}... (⌘K)`} />
                    <kbd className="search-kbd">⌘K</kbd>
                </div>
            </div>

            <div className="navbar-right">
                <div className="nav-actions-v3">
                    {/* Language Picker */}
                    <div className="nav-lang-picker" ref={langRef}>
                        <button
                            className={`nav-icon-btn-v3 ${isLangOpen ? 'active' : ''}`}
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            title="Change language"
                        >
                            <Globe size={19} />
                        </button>
                        <AnimatePresence>
                            {isLangOpen && (
                                <motion.div
                                    className="lang-dropdown-v3"
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="dropdown-header-v3">Language</div>
                                    {Object.entries(langNames).map(([code, { label, flag }]) => (
                                        <button
                                            key={code}
                                            className={`lang-option-v3 ${i18n.language === code ? 'selected' : ''}`}
                                            onClick={() => toggleLanguage(code)}
                                        >
                                            <span className="lang-flag">{flag}</span>
                                            <span>{label}</span>
                                            {i18n.language === code && <Check size={14} className="lang-check" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <ThemeToggle />

                    {/* Notification Bell */}
                    <div className="nav-notifications-v3">
                        <button
                            className={`nav-icon-btn-v3 ${isNotificationsOpen ? 'active' : ''} ${bellShake ? 'bell-shake' : ''}`}
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                        >
                            <Bell size={19} />
                            <AnimatePresence>
                                {unreadCount > 0 && (
                                    <motion.span
                                        className="notif-badge-v3"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                        <NotificationPanel
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkRead={handleMarkRead}
                            onMarkAllRead={handleMarkAllRead}
                        />
                    </div>
                </div>

                <div className="nav-divider-v3"></div>

                {/* User Profile Dropdown */}
                <div className="user-profile-wrapper" ref={userMenuRef}>
                    <button
                        className={`user-profile-v3 ${isUserMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        <div className="user-avatar-v3 outfit">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info-v3">
                            <span className="u-name-v3">{user?.username || 'User'}</span>
                            <span className="u-meta-v3">
                                <span className={`plan-pill ${planBadge.toLowerCase()}`}>{planBadge}</span>
                                {roleDisplay && <span className="role-text">{roleDisplay}</span>}
                            </span>
                        </div>
                        <ChevronDown
                            size={15}
                            className={`chevron-icon ${isUserMenuOpen ? 'rotated' : ''}`}
                        />
                    </button>
                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                className="user-menu-v3"
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="user-menu-header">
                                    <div className="user-avatar-v3 outfit lg">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="um-name">{user?.name || user?.username}</div>
                                        <div className="um-email">{user?.email || 'demo@orderstream.app'}</div>
                                    </div>
                                </div>
                                <div className="user-menu-divider"></div>
                                <button className="user-menu-item" onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }}>
                                    <User size={16} /> Profile & Settings
                                </button>
                                <button className="user-menu-item" onClick={() => { setIsUserMenuOpen(false); navigate('/billing'); }}>
                                    <CreditCard size={16} /> Billing
                                </button>
                                <button className="user-menu-item" onClick={() => { setIsUserMenuOpen(false); navigate('/pricing'); }}>
                                    <Crown size={16} /> Upgrade Plan
                                    {planBadge === 'FREE' && <span className="upgrade-badge">PRO</span>}
                                </button>
                                <div className="user-menu-divider"></div>
                                <button className="user-menu-item danger" onClick={() => { setIsUserMenuOpen(false); logout(); }}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
