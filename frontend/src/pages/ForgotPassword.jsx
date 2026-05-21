import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Login.css';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState('email'); // email | code | done
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) return;
        try {
            setError('');
            setLoading(true);
            await api.post('/auth/forgot-password', { email });
            toast.success('Reset code sent to your email!');
            setStep('code');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || '';
            if (msg.includes('not configured')) {
                setError('Email service is not configured on this server. Contact the administrator.');
            } else if (msg.includes('not found')) {
                setError('No account found with that email address.');
            } else {
                setError(msg || 'Failed to send reset code. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
        if (newPassword !== confirmPassword) return setError('Passwords do not match.');
        try {
            setError('');
            setLoading(true);
            await api.post('/auth/reset-password', { email, code, newPassword });
            toast.success('Password reset successfully!');
            setStep('done');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div className="auth-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {step === 'email' && (
                        <>
                            <div className="auth-header">
                                <KeyRound size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '1rem' }} />
                                <h1 className="outfit">Reset Password</h1>
                                <p>Enter your email and we'll send you a reset code</p>
                            </div>
                            <form onSubmit={handleSendCode} className="auth-form">
                                {error && <div className="auth-error">{error}</div>}
                                <div className="input-group">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                    Send Reset Code <ArrowRight size={18} />
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 'code' && (
                        <>
                            <div className="auth-header">
                                <Lock size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '1rem' }} />
                                <h1 className="outfit">Enter Reset Code</h1>
                                <p>We sent a code to <strong>{email}</strong></p>
                            </div>
                            <form onSubmit={handleResetPassword} className="auth-form">
                                {error && <div className="auth-error">{error}</div>}
                                <div className="input-group">
                                    <KeyRound size={18} />
                                    <input
                                        type="text"
                                        placeholder="6-digit code"
                                        required
                                        maxLength="6"
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    />
                                </div>
                                <div className="input-group">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        placeholder="New password (8+ chars)"
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                    Reset Password <ArrowRight size={18} />
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="auth-header" style={{ padding: '2rem 0' }}>
                            <CheckCircle size={64} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                            <h1 className="outfit">Password Reset!</h1>
                            <p style={{ marginBottom: '1.5rem' }}>Your password has been changed successfully.</p>
                            <Link to="/login">
                                <Button variant="primary" className="w-full">
                                    Sign In <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>
                    )}

                    <p className="auth-footer">
                        <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Back to Sign In</Link>
                    </p>
                </motion.div>
            </div>

            <div className="auth-visual">
                <div className="visual-content">
                    <h2 className="outfit">Secure Account Recovery</h2>
                    <p>We'll help you get back into your OrderStream account safely and quickly.</p>
                </div>
                <div className="visual-blobs">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
