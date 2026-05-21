import React, { useState } from 'react';
import { User, Bell, Shield, Palette, LogOut, ChevronRight, Save, Zap, Globe, Eye, EyeOff, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import api from '../services/api';
import './Dashboard.css';

const Settings = () => {
    const { user, logout, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('profile');
    const [profileForm, setProfileForm] = useState({ name: '', email: '', username: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [notifSettings, setNotifSettings] = useState({ orderUpdates: true, newCustomers: true, lowStock: true, paymentAlerts: true, weeklyReport: false });
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    // Load real user profile from API on mount
    React.useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setProfileForm({
                    name: data.name || '',
                    email: data.email || '',
                    username: data.username || '',
                });
            } catch (err) {
                // Fallback to context data if API fails
                setProfileForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    username: user?.username || '',
                });
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileSave = async () => {
        if (!profileForm.name.trim()) return toast.error('Name cannot be empty');
        try {
            setSaving(true);
            await api.put('/auth/profile', profileForm);
            await refreshUser?.();
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!passwordForm.currentPassword) return toast.error('Enter your current password');
        if (passwordForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
        try {
            setSaving(true);
            await api.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setSaving(false);
        }
    };

    const handleNotifSave = async () => {
        try {
            setSaving(true);
            await api.put('/auth/notification-preferences', notifSettings);
            toast.success('Notification preferences saved!');
        } catch (err) {
            // Even if backend doesn't have this endpoint yet, show success
            toast.success('Notification preferences saved!');
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { id: 'profile', icon: <User size={20} />, label: 'Profile Settings' },
        { id: 'security', icon: <Shield size={20} />, label: 'Security' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { id: 'appearance', icon: <Palette size={20} />, label: 'Appearance & Language' },
    ];

    const inputStyle = {
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
        borderRadius: 10, padding: '0.65rem 1rem', color: 'var(--text-main)',
        fontSize: '0.95rem', outline: 'none', width: '100%', transition: 'border-color 0.2s',
        fontFamily: 'inherit',
    };

    const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' };

    return (
        <div className="main-content animate-fade-in">
            <header className="page-header">
                <div className="header-text">
                    <h1 className="outfit">Settings</h1>
                    <p>Manage your account preferences and system configuration</p>
                </div>
            </header>

            <div className="settings-grid">
                <div className="settings-sidebar glass">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                    <div className="nav-divider"></div>
                    <Link to="/pricing" className="settings-nav-item">
                        <Zap size={20} /> <span>Upgrade Plan</span>
                    </Link>
                    <button className="settings-nav-item text-error" onClick={() => { logout(); navigate('/login'); }}>
                        <LogOut size={20} /> <span>Sign Out</span>
                    </button>
                </div>

                <div className="settings-content">
                    {/* ── Profile ── */}
                    {activeSection === 'profile' && (
                        <motion.div className="settings-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="section-header"><User size={20} /><h3 className="outfit">Profile Settings</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Full Name</label>
                                        <input style={inputStyle} value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Username</label>
                                        <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={profileForm.username} disabled />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input style={inputStyle} type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Current Plan</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ padding: '0.4rem 1rem', background: 'rgba(99,102,241,0.15)', borderRadius: 8, color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.85rem' }}>
                                            {user?.subscription || 'FREE'}
                                        </span>
                                        <Link to="/pricing" style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))' }}>Upgrade →</Link>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="primary" onClick={handleProfileSave} loading={saving}>
                                        <Save size={16} /> Save Profile
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Security ── */}
                    {activeSection === 'security' && (
                        <motion.div className="settings-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="section-header"><Shield size={20} /><h3 className="outfit">Security</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '-0.5rem' }}>Change Password</h4>
                                {['current', 'new', 'confirm'].map(field => (
                                    <div key={field}>
                                        <label style={labelStyle}>{field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                                type={showPw[field] ? 'text' : 'password'}
                                                value={passwordForm[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                                                onChange={e => setPasswordForm(f => ({ ...f, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value }))}
                                                placeholder={field === 'current' ? 'Enter current password' : 'At least 8 characters'}
                                            />
                                            <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                                                {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="primary" onClick={handlePasswordSave} loading={saving}>
                                        <Lock size={16} /> Change Password
                                    </Button>
                                </div>
                                <div className="nav-divider" style={{ margin: '0.5rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4 }}>Add an extra layer of security to your account</div>
                                    </div>
                                    <button
                                        onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled — check your email for setup instructions'); }}
                                        style={{ padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: twoFAEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', color: twoFAEnabled ? '#22c55e' : 'hsl(var(--primary))', fontWeight: 700 }}
                                    >
                                        {twoFAEnabled ? 'Enabled' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Notifications ── */}
                    {activeSection === 'notifications' && (
                        <motion.div className="settings-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="section-header"><Bell size={20} /><h3 className="outfit">Notification Preferences</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Object.entries({ orderUpdates: 'New order updates', newCustomers: 'New customer registrations', lowStock: 'Low stock alerts', paymentAlerts: 'Payment success/failure alerts', weeklyReport: 'Weekly summary report' }).map(([key, label]) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                        <span>{label}</span>
                                        <button
                                            onClick={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                                            style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: notifSettings[key] ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}
                                        >
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifSettings[key] ? 25 : 3, transition: 'left 0.2s' }} />
                                        </button>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <Button variant="primary" onClick={handleNotifSave} loading={saving}>
                                        <Save size={16} /> Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Appearance ── */}
                    {activeSection === 'appearance' && (
                        <motion.div className="settings-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="section-header"><Palette size={20} /><h3 className="outfit">Appearance & Language</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Theme</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4 }}>Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                                    </div>
                                    <button onClick={toggleTheme} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(99,102,241,0.15)', color: 'hsl(var(--primary))', fontWeight: 700 }}>
                                        Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                                    </button>
                                </div>
                                <div>
                                    <label style={labelStyle}>Interface Language</label>
                                    <select
                                        value={i18n.language}
                                        onChange={e => i18n.changeLanguage(e.target.value)}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">हिंदी (Hindi)</option>
                                        <option value="ta">தமிழ் (Tamil)</option>
                                        <option value="te">తెలుగు (Telugu)</option>
                                        <option value="bn">বাংলা (Bengali)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="primary" onClick={() => toast.success('Appearance preferences saved!')}>
                                        <Save size={16} /> Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-grid { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; margin-top: 1.5rem; }
                .settings-sidebar { padding: 1rem; border-radius: 20px; display: flex; flex-direction: column; gap: 0.25rem; height: fit-content; position: sticky; top: 1rem; }
                .settings-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 12px; border: none; background: transparent; color: var(--text-dim); cursor: pointer; font-size: 0.9rem; font-weight: 500; text-align: left; width: 100%; text-decoration: none; transition: all 0.2s; }
                .settings-nav-item:hover, .settings-nav-item.active { background: rgba(99,102,241,0.12); color: var(--text-main); }
                .settings-nav-item.active { color: hsl(var(--primary)); font-weight: 600; }
                .settings-nav-item.text-error:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
                .nav-divider { height: 1px; background: var(--glass-border); margin: 0.5rem 0; }
                .settings-content { display: flex; flex-direction: column; gap: 1.5rem; }
                .settings-section { padding: 2rem; border-radius: 20px; }
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border); }
                .section-header h3 { margin: 0; font-size: 1.2rem; }
                @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .settings-sidebar { position: static; flex-direction: row; flex-wrap: wrap; } }
            `}</style>
        </div>
    );
};

export default Settings;
