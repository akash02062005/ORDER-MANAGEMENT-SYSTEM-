import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Star, Shield, Check, ArrowRight, Users, Headphones, Globe, Database, AlertCircle, Crown, Sparkles, X, CreditCard, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout, fetchPlans } from '../services/paymentService';

const Pricing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currentPlan = user?.subscription || 'FREE';
    const [busyPlan, setBusyPlan] = useState(null);
    const [interval, setInterval] = useState('month');
    const [serverPlans, setServerPlans] = useState(null);

    useEffect(() => {
        fetchPlans().then(setServerPlans).catch(() => {});
    }, []);

    const plans = [
        {
            id: 'FREE', name: 'Starter', price: '₹0', priceUsd: '$0', period: '/month',
            yearlyPrice: '₹0',
            desc: 'Perfect for trying things out',
            features: ['Up to 100 orders/month', 'Basic analytics dashboard', 'Community support', '1 team member', 'Email notifications'],
            icon: <Zap size={22} />, color: '#94a3b8', gradient: 'linear-gradient(135deg, #334155, #1e293b)',
            amountInr: 0, amountUsd: 0,
        },
        {
            id: 'PREMIUM', name: 'Growth', price: '₹2,499', priceUsd: '$29.99', period: '/month',
            yearlyPrice: '₹1,999',
            desc: 'For growing businesses',
            features: ['Unlimited orders', 'Advanced analytics & AI insights', 'Priority email & chat support', 'Up to 10 team members', 'Custom reports & CSV export', 'Razorpay payment integration', 'Multi-currency support'],
            icon: <Star size={22} />, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            popular: true, amountInr: 249900, amountUsd: 2999,
        },
        {
            id: 'PRO', name: 'Enterprise', price: '₹7,999', priceUsd: '$99.99', period: '/month',
            yearlyPrice: '₹6,499',
            desc: 'For scaling operations',
            features: ['Everything in Growth', 'Full API access', 'White-label branding', 'Dedicated account manager', '24/7 phone & priority support', 'Custom integrations', 'SLA guarantee (99.99% uptime)', 'Unlimited team members'],
            icon: <Shield size={22} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            amountInr: 799900, amountUsd: 9999,
        },
    ];

    const handleSubscribe = async (plan) => {
        if (plan.id === 'FREE') return;
        if (!user) {
            toast.error('Please sign in to subscribe');
            navigate('/login');
            return;
        }

        setBusyPlan(plan.id);
        try {
            const result = await openRazorpayCheckout({
                plan: plan.id,
                user,
                onSuccess: (response) => {
                    toast.success(`${plan.name} plan activated! Welcome aboard!`, { autoClose: 5000 });
                    // Navigate to billing after short delay
                    setTimeout(() => navigate('/billing?status=success'), 1500);
                },
                onFailure: (reason) => {
                    if (reason !== 'cancelled') {
                        toast.error(`Payment failed: ${reason}`);
                    }
                },
            });

            if (!result?.ok && result?.error === 'cancelled') {
                toast.info('Payment cancelled. You can try again anytime.');
            }
        } catch (err) {
            const msg = err?.message || 'Could not start checkout';
            toast.error(msg);
        } finally {
            setBusyPlan(null);
        }
    };

    return (
        <div className="main-content animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', padding: '1rem 0 2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px', borderRadius: 100,
                        background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)',
                        marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#818cf8'
                    }}>
                        <Sparkles size={14} /> 14-day free trial on all paid plans
                    </div>
                    <h1 className="outfit" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem',
                        background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Choose the right plan for your team
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', margin: 0, maxWidth: 500, marginInline: 'auto' }}>
                        Start free, scale as you grow. Powered by Razorpay for secure payments.
                    </p>
                </motion.div>

                {/* Interval Toggle */}
                <div style={{
                    display: 'inline-flex', gap: 4, padding: 4, borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    marginTop: '1.5rem'
                }}>
                    {['month', 'year'].map(v => (
                        <button
                            key={v}
                            onClick={() => setInterval(v)}
                            style={{
                                padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                                background: interval === v ? '#6366f1' : 'transparent',
                                color: interval === v ? '#fff' : 'rgba(255,255,255,0.4)',
                            }}
                        >
                            {v === 'month' ? 'Monthly' : 'Yearly'}
                            {v === 'year' && <span style={{ marginLeft: 4, fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>-20%</span>}
                        </button>
                    ))}
                </div>
            </header>

            {/* Plan Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {plans.map((plan, i) => {
                    const isCurrent = plan.id === currentPlan;
                    const displayPrice = interval === 'year' && plan.yearlyPrice !== '₹0' ? plan.yearlyPrice : plan.price;
                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -6 }}
                            className="glass"
                            style={{
                                padding: '2rem', borderRadius: 24, position: 'relative',
                                display: 'flex', flexDirection: 'column', gap: '1.25rem',
                                border: plan.popular ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: plan.popular ? '0 20px 50px rgba(99, 102, 241, 0.12)' : 'none',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <span style={{
                                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                                    padding: '5px 16px', borderRadius: '0 0 12px 12px',
                                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                                }}>
                                    Most popular
                                </span>
                            )}

                            {/* Glow effect */}
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                                    background: '#6366f1', filter: 'blur(50px)', opacity: 0.06, pointerEvents: 'none'
                                }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: plan.color }}>
                                <div style={{
                                    padding: '0.4rem', borderRadius: 10,
                                    background: `${plan.color}14`, display: 'flex'
                                }}>
                                    {plan.icon}
                                </div>
                                <h2 className="outfit" style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem' }}>
                                    {plan.name}
                                </h2>
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayPrice}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
                                        /{interval === 'year' ? 'mo' : 'month'}
                                    </span>
                                </div>
                                {plan.id !== 'FREE' && (
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                        {interval === 'year' ? 'Billed annually' : `or ${plan.priceUsd}/mo in USD`}
                                    </div>
                                )}
                            </div>

                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>{plan.desc}</p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                {plan.features.map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        <Check size={14} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? 'primary' : 'secondary'}
                                onClick={() => handleSubscribe(plan)}
                                disabled={isCurrent || plan.id === 'FREE'}
                                loading={busyPlan === plan.id}
                                style={{ marginTop: 'auto' }}
                            >
                                {isCurrent ? (
                                    <><Check size={16} /> Current plan</>
                                ) : plan.id === 'FREE' ? (
                                    'Free forever'
                                ) : (
                                    <>
                                        <CreditCard size={15} /> Get {plan.name} <ArrowRight size={14} />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Payment Method Badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    display: 'flex', justifyContent: 'center', gap: '0.75rem',
                    marginTop: '2rem', flexWrap: 'wrap'
                }}
            >
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets'].map(method => (
                    <span key={method} style={{
                        padding: '6px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '0.75rem', fontWeight: 500,
                        color: 'rgba(255,255,255,0.35)'
                    }}>
                        {method}
                    </span>
                ))}
            </motion.div>

            {/* Trust Signals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '2.5rem', paddingBottom: '2rem' }}>
                {[
                    { icon: <Users size={22} />, title: '10,000+ businesses', desc: 'Trust OrderStream worldwide' },
                    { icon: <Globe size={22} />, title: '99.99% uptime SLA', desc: 'Enterprise-grade reliability' },
                    { icon: <Headphones size={22} />, title: '24/7 support', desc: 'Available on all paid plans' },
                    { icon: <Shield size={22} />, title: 'Razorpay secured', desc: 'PCI-DSS compliant payments' },
                ].map((item, i) => (
                    <motion.div key={i} className="glass"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        style={{
                            padding: '1.25rem', borderRadius: 14, display: 'flex', gap: '0.75rem',
                            alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)'
                        }}
                    >
                        <div style={{ color: '#818cf8', flexShrink: 0 }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: 2 }}>{item.desc}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
