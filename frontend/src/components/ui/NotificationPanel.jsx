import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBag, User, Info, CheckCircle, Clock, AlertTriangle, X, Check, CheckCheck, Inbox } from 'lucide-react';
import './NotificationPanel.css';

const iconMap = {
    order: <ShoppingBag size={16} />,
    user: <User size={16} />,
    system: <Info size={16} />,
    success: <CheckCircle size={16} />,
    warning: <AlertTriangle size={16} />,
};

const colorMap = {
    order: { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' },
    user: { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' },
    system: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' },
    success: { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' },
};

const NotificationPanel = ({ isOpen, onClose, notifications = [], onMarkRead, onMarkAllRead }) => {
    const { t } = useTranslation();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (n) => {
        if (n.time) return n.time;
        if (n.createdAt) {
            const d = new Date(n.createdAt);
            const now = new Date();
            const diffMs = now - d;
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) return 'Just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffH = Math.floor(diffMin / 60);
            if (diffH < 24) return `${diffH}h ago`;
            return d.toLocaleDateString();
        }
        return '';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    className="notif-panel-v3"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <div className="np-header">
                        <div className="np-header-left">
                            <h4 className="outfit">{t('notifications')}</h4>
                            {unreadCount > 0 && (
                                <motion.span
                                    className="np-count"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    key={unreadCount}
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </div>
                        <div className="np-header-actions">
                            {unreadCount > 0 && (
                                <button className="np-mark-all" onClick={onMarkAllRead} title="Mark all as read">
                                    <CheckCheck size={15} /> Read all
                                </button>
                            )}
                            <button className="np-close" onClick={onClose}>
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="np-body">
                        {notifications.length === 0 ? (
                            <div className="np-empty">
                                <div className="np-empty-icon">
                                    <Inbox size={28} />
                                </div>
                                <p className="np-empty-title">All caught up!</p>
                                <p className="np-empty-desc">No notifications yet. They'll appear here in real-time.</p>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {notifications.map((n, i) => {
                                    const colors = colorMap[n.type] || colorMap.system;
                                    return (
                                        <motion.div
                                            key={n.id}
                                            className={`np-item ${n.read ? 'read' : 'unread'}`}
                                            onClick={() => !n.read && onMarkRead?.(n.id)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            layout
                                        >
                                            <div className="np-item-icon" style={{ background: colors.bg, color: colors.color }}>
                                                {iconMap[n.type] || <Bell size={16} />}
                                            </div>
                                            <div className="np-item-content">
                                                <p className="np-item-title">{n.title}</p>
                                                <p className="np-item-desc">{n.message || n.desc}</p>
                                                <div className="np-item-time">
                                                    <Clock size={10} />
                                                    <span>{formatTime(n)}</span>
                                                </div>
                                            </div>
                                            {!n.read && (
                                                <motion.div
                                                    className="np-unread-dot"
                                                    layoutId={`dot-${n.id}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
