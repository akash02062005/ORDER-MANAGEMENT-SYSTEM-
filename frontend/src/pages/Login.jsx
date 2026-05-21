import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, Mail, RefreshCw, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { requestMagicLink, verifyMagicLink } from '../services/authMagicLink';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
    const { t } = useTranslation();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [magicMode, setMagicMode] = useState(false);
    const [magicEmail, setMagicEmail] = useState('');
    const [magicSent, setMagicSent] = useState(false);
    const { login, verifyOtp, resendOtp, loginSocial, providers } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle Magic-link callback (?magic=) and registration redirects
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const magic = params.get('magic');
        const registered = params.get('registered');
        const verified = params.get('verified');

        if (registered) toast.info('Account created! Please sign in.');
        if (verified) toast.success('Email verified! You can now sign in.');

        if (token) {
            setLoading(true);
            loginSocial(token)
                .then(userData => {
                    if (userData?.onboardingComplete === false || !userData?.organizationId) {
                        navigate('/onboarding');
                    } else {
                        navigate('/');
                    }
                })
                .catch(() => {
                    setError('Login failed. Please try again.');
                    setLoading(false);
                });
            // Clean URL
            window.history.replaceState({}, '', '/login');
            return;
        }
        if (magic) {
            setLoading(true);
            verifyMagicLink(magic)
                .then(res => loginSocial(res.token).then(() => navigate('/')))
                .catch(() => {
                    setError('Magic link is invalid or expired. Please request a new one.');
                    setLoading(false);
                });
        }
    }, []);

    const handleSendMagicLink = async (e) => {
        e.preventDefault();
        if (!magicEmail) return;
        try {
            setLoading(true);
            setError('');
            await requestMagicLink(magicEmail);
            setMagicSent(true);
            toast.success('Magic link sent! Check your inbox.');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || '';
            if (msg.includes('not configured') || msg.includes('RESEND')) {
                setError('Email service is not configured. Please set RESEND_API_KEY in your backend .env file.');
            } else {
                setError('Could not send magic link. Please check your backend is running and email is configured.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => setCredentials(c => ({ ...c, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(credentials);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid username or password';
            if (msg.toLowerCase().includes('verified') || msg.toLowerCase().includes('verify')) {
                setIsVerifying(true);
                setVerifyEmail(credentials.username);
                toast.info('Please verify your email first. Check your inbox.');
            } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Cannot connect to the server. Please make sure the backend is running on port 8080.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) return setError('Enter the 6-digit code from your email.');
        try {
            setLoading(true);
            setError('');
            const emailForVerify = verifyEmail || credentials.username;
            await verifyOtp(emailForVerify, otp);
            toast.success('Email verified! Signing you in...');
            try {
                await login(credentials);
                navigate('/');
            } catch {
                navigate('/login?verified=true');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid OTP. Try resending.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const emailForResend = verifyEmail || credentials.username;
            await resendOtp(emailForResend);
            setError('');
            toast.success('New verification code sent!');
        } catch (err) {
            setError('Failed to resend. Check your backend email configuration.');
        }
    };

    if (isVerifying) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <motion.div className="auth-card glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="auth-header">
                            <ShieldCheck size={48} className="auth-icon" style={{ color: 'var(--primary)' }} />
                            <h2 className="outfit">{t('verify_identity')}</h2>
                            <p>Enter the 6-digit code sent to <strong>{verifyEmail || credentials.username}</strong></p>
                        </div>
                        <form onSubmit={handleVerifyOtp} className="auth-form">
                            {error && <div className="auth-error">{error}</div>}
                            <div className="input-group">
                                <Lock size={18} />
                                <input type="text" placeholder="Enter 6-digit OTP" required maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                            </div>
                            <Button type="submit" loading={loading} className="w-full">
                                {t('confirm_verification')} <ArrowRight size={18} />
                            </Button>
                        </form>
                        <div className="auth-footer">
                            <button onClick={handleResend} className="resend-btn"><RefreshCw size={14} /> {t('resend_code')}</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div className="auth-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <h1 className="outfit">{t('welcome_back')}</h1>
                        <p>{t('login_subtitle')}</p>
                    </div>

                    {/* Demo mode hint */}
                    <div style={{
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)',
                        display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer'
                    }} onClick={() => setCredentials({ username: 'demo', password: 'demo' })}>
                        <span style={{ fontSize: '1rem' }}>🚀</span>
                        <span>Try demo: click here or use <b style={{ color: '#a5b4fc' }}>demo / demo</b> (works without backend)</span>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}
                        <div className="input-group">
                            <User size={18} />
                            <input type="text" name="username" placeholder={t('username')} required value={credentials.username} onChange={handleChange} autoComplete="username" />
                        </div>
                        <div className="input-group">
                            <Lock size={18} />
                            <input type="password" name="password" placeholder={t('password')} required value={credentials.password} onChange={handleChange} autoComplete="current-password" />
                        </div>
                        <div className="auth-options">
                            <label className="remember-me"><input type="checkbox" /> {t('remember_me')}</label>
                            <Link to="/forgot-password">{t('forgot_password_q')}</Link>
                        </div>
                        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                            {loading ? t('signing_in') : t('sign_in')} <ArrowRight size={18} />
                        </Button>

                        {providers.magicLink && (
                            <button type="button" className="magic-link-toggle" onClick={() => { setMagicMode(!magicMode); setMagicSent(false); setError(''); }}
                                style={{ marginTop: 12, background: 'transparent', border: '1px dashed var(--border)', padding: '10px 14px', borderRadius: 12, color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%', fontWeight: 600 }}>
                                <Wand2 size={16} /> {magicMode ? 'Use password instead' : 'Sign in with magic link'}
                            </button>
                        )}

                        {magicMode && (
                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {magicSent ? (
                                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
                                        <Mail size={16} /> Check your inbox — a sign-in link has been sent!
                                    </div>
                                ) : (
                                    <>
                                        <div className="input-group">
                                            <Mail size={18} />
                                            <input type="email" placeholder="your@email.com" value={magicEmail} onChange={e => setMagicEmail(e.target.value)} />
                                        </div>
                                        <Button type="button" variant="secondary" onClick={handleSendMagicLink} disabled={loading || !magicEmail} className="w-full">
                                            Send magic link <Wand2 size={16} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </form>

                    <p className="auth-footer">
                        {t('dont_have_account')} <Link to="/register">{t('create_one')}</Link>
                    </p>
                </motion.div>
            </div>

            <div className="auth-visual">
                <div className="visual-content">
                    <h2 className="outfit">OrderStream for Business</h2>
                    <p>The complete operating system for your modern business. Manage orders, inventory, payments, and analytics in one powerful platform.</p>
                    <div className="visual-stats">
                        <div className="v-stat"><span className="outfit">10K+</span><small>Businesses</small></div>
                        <div className="v-stat"><span className="outfit">99.99%</span><small>Uptime</small></div>
                        <div className="v-stat"><span className="outfit">4.9/5</span><small>Rating</small></div>
                    </div>
                </div>
                <div className="visual-blobs">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
