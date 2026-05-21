import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, ArrowRight, ShieldCheck, RefreshCw, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import './Login.css';

const Register = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'ROLE_ADMIN' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState('');
    const { register, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
        if (formData.password.length < 8) return setError('Password must be at least 8 characters long.');

        try {
            setError('');
            setLoading(true);
            const payload = {
                ...formData,
                roles: [formData.role || 'ROLE_ADMIN'],
            };
            delete payload.role;
            delete payload.confirmPassword;
            const res = await register(payload);
            const userData = res?.data || res;

            // If user was auto-verified (dev mode - no email service), redirect to login directly
            if (userData?.verified === true) {
                toast.success('Account created! You can now sign in.');
                navigate('/login?registered=true');
                return;
            }

            // Otherwise show OTP verification screen
            setIsVerifying(true);
            toast.success('Account created! Check your email for a verification code.');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed.';
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Cannot connect to the server. Please make sure the backend is running on port 8080.');
            } else if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('otp')) {
                setIsVerifying(true);
                toast.info('Check your email for a verification code.');
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
            await verifyOtp(formData.email, otp);
            toast.success('Email verified! You can now sign in.');
            navigate('/login?verified=true');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired OTP. Try resending.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp(formData.email);
            setError('');
            toast.success('New verification code sent to ' + formData.email);
        } catch (err) {
            setError('Failed to resend code. Check your email configuration.');
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
                            <p>We sent a 6-digit code to <strong>{formData.email}</strong></p>
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
                        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                            <button onClick={handleResend} className="resend-btn"><RefreshCw size={14} /> {t('resend_code')}</button>
                            <button onClick={() => setIsVerifying(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.85rem' }}>&larr; Back to registration</button>
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
                        <h1 className="outfit">{t('create_account')}</h1>
                        <p>Start your 14-day free trial. No credit card required.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}

                        <div className="input-group">
                            <User size={18} />
                            <input type="text" name="username" placeholder={t('username')} required value={formData.username} onChange={handleChange} autoComplete="username" />
                        </div>
                        <div className="input-group">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder={t('email_address')} required value={formData.email} onChange={handleChange} autoComplete="email" />
                        </div>
                        <div className="input-grid">
                            <div className="input-group">
                                <Lock size={18} />
                                <input type="password" name="password" placeholder={t('password')} required minLength={8} value={formData.password} onChange={handleChange} autoComplete="new-password" />
                            </div>
                            <div className="input-group">
                                <Shield size={18} />
                                <input type="password" name="confirmPassword" placeholder={t('confirm_password')} required value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full">
                            Create Account <ArrowRight size={18} />
                        </Button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </form>

                    <p className="auth-footer">
                        {t('already_have_account')} <Link to="/login">{t('sign_in')}</Link>
                    </p>
                </motion.div>
            </div>

            <div className="auth-visual">
                <div className="visual-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Building2 size={28} style={{ color: 'hsl(var(--primary))' }} />
                        <h2 className="outfit" style={{ margin: 0 }}>Built for Growing Teams</h2>
                    </div>
                    <div className="signup-features">
                        <div className="sf-item"><span className="sf-check">&#10003;</span> Multi-tenant workspace</div>
                        <div className="sf-item"><span className="sf-check">&#10003;</span> Real-time analytics & AI insights</div>
                        <div className="sf-item"><span className="sf-check">&#10003;</span> Razorpay payments</div>
                        <div className="sf-item"><span className="sf-check">&#10003;</span> Team roles & permissions</div>
                        <div className="sf-item"><span className="sf-check">&#10003;</span> Automated invoicing & shipping</div>
                    </div>
                </div>
                <div className="visual-blobs">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
            </div>

            <style>{`
                .signup-features { display: flex; flex-direction: column; gap: 1rem; }
                .sf-item { display: flex; align-items: center; gap: 0.75rem; font-size: 1.05rem; color: rgba(255,255,255,0.85); }
                .sf-check { color: #22c55e; font-weight: 700; font-size: 1.1rem; }
            `}</style>
        </div>
    );
};

export default Register;
