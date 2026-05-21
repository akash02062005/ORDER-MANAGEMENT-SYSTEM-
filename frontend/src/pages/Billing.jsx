import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, IndianRupee, Crown, Sparkles, ShieldCheck, AlertCircle, ArrowRight, Zap, Receipt, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchPlans,
  fetchMySubscription,
  openRazorpayCheckout,
} from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const PLAN_ICONS = {
  FREE: <ShieldCheck size={22} />,
  PREMIUM: <Sparkles size={22} />,
  PRO: <Crown size={22} />,
};

const PLAN_COLORS = {
  FREE: '#94a3b8',
  PREMIUM: '#6366f1',
  PRO: '#f59e0b',
};

const FALLBACK_PLANS = {
  FREE:    { id: 'FREE',    name: 'Starter',    amountInr: 0,      amountUsd: 0,    features: ['Up to 100 orders/month', 'Basic analytics', '1 team member', 'Community support'] },
  PREMIUM: { id: 'PREMIUM', name: 'Growth',     amountInr: 249900, amountUsd: 2999, features: ['Unlimited orders', 'Advanced analytics & AI', 'Up to 10 team members', 'Priority support', 'Payment integrations', 'Custom reports'] },
  PRO:     { id: 'PRO',     name: 'Enterprise', amountInr: 799900, amountUsd: 9999, features: ['Everything in Growth', 'Full API access', 'White-label branding', 'Dedicated account manager', '24/7 phone support', 'Custom integrations', 'SLA 99.99% uptime'] },
};

const Billing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const currency = 'inr';
  const [busyPlan, setBusyPlan] = useState(null);
  const [plans, setPlans] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const status = params.get('status');
    if (status === 'success') toast.success('Payment successful! Your plan is being activated.');
    if (status === 'cancelled') toast.info('Checkout cancelled.');
  }, [params]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchPlans();
        setPlans(p);
      } catch {
        setPlans(FALLBACK_PLANS);
      }
      try {
        const s = await fetchMySubscription();
        setSub(s);
      } catch {
        setSub({ plan: user?.subscription || 'FREE' });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const currentPlan = sub?.plan || user?.subscription || 'FREE';

  const planList = useMemo(() => {
    const src = plans || FALLBACK_PLANS;
    return ['FREE', 'PREMIUM', 'PRO'].map(id => src[id]).filter(Boolean);
  }, [plans]);

  const formatPrice = (plan) => {
    if (plan.id === 'FREE') return currency === 'inr' ? '₹0' : '$0';
    const amt = currency === 'inr' ? plan.amountInr : plan.amountUsd;
    const symbol = currency === 'inr' ? '₹' : '$';
    return `${symbol}${(amt / 100).toLocaleString()}`;
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'FREE') return;
    if (!user) { toast.error('Please sign in first'); return; }
    try {
      setBusyPlan(planId);
      const result = await openRazorpayCheckout({
        plan: planId, user,
        onSuccess: (response) => {
          toast.success(`${planId} plan activated! Payment ID: ${response.razorpay_payment_id || 'confirmed'}`, { autoClose: 5000 });
          setSub(s => ({ ...s, plan: planId }));
        },
        onFailure: (reason) => {
          if (reason !== 'cancelled') toast.error(`Payment failed: ${reason}`);
        },
      });
      if (!result?.ok && result?.error === 'cancelled') {
        toast.info('Payment cancelled');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '';
      toast.error(msg || 'Could not start checkout. Please try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: 200, borderRadius: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="outfit" style={{
            fontSize: '2rem', fontWeight: 800, margin: '0 0 0.3rem',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <CreditCard size={26} /> Billing & Subscription
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: '0.9rem' }}>
            Manage your plan and payment history
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 10,
          background: `${PLAN_COLORS[currentPlan]}14`,
          border: `1px solid ${PLAN_COLORS[currentPlan]}25`,
        }}>
          {PLAN_ICONS[currentPlan]}
          <span style={{ fontWeight: 700, color: PLAN_COLORS[currentPlan] }}>{currentPlan} Plan</span>
        </div>
      </header>

      {/* Current Plan Summary */}
      <motion.div
        className="glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '1.5rem', borderRadius: 20,
          border: `1px solid ${PLAN_COLORS[currentPlan]}20`,
          marginBottom: '2rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          background: `linear-gradient(135deg, ${PLAN_COLORS[currentPlan]}06, transparent)`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${PLAN_COLORS[currentPlan]}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: PLAN_COLORS[currentPlan]
          }}>
            {PLAN_ICONS[currentPlan]}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {FALLBACK_PLANS[currentPlan]?.name || currentPlan} Plan
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
              {currentPlan === 'FREE'
                ? 'Upgrade to unlock more features'
                : `Active since ${sub?.history?.[0]?.createdAt ? new Date(sub.history[0].createdAt).toLocaleDateString() : 'recently'}`
              }
            </p>
          </div>
        </div>
        {currentPlan === 'FREE' && (
          <button
            onClick={() => navigate('/pricing')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Zap size={15} /> Upgrade Now <ArrowRight size={14} />
          </button>
        )}
      </motion.div>

      {/* Plan Cards */}
      <h2 className="outfit" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        {currentPlan === 'FREE' ? 'Choose a plan' : 'Available plans'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {planList.map((plan, i) => {
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.id === 'PREMIUM';
          const planColor = PLAN_COLORS[plan.id] || '#6366f1';
          return (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} whileHover={{ y: -5 }}
              className="glass"
              style={{
                padding: '1.75rem', borderRadius: 20, position: 'relative',
                border: isCurrent ? `1px solid ${planColor}40` : isPopular ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: isCurrent ? `0 15px 40px ${planColor}10` : 'none',
                overflow: 'hidden'
              }}
            >
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 8,
                  background: `${planColor}15`, fontSize: '0.65rem', fontWeight: 700,
                  color: planColor, textTransform: 'uppercase'
                }}>
                  <CheckCircle2 size={12} /> Current
                </div>
              )}
              {isPopular && !isCurrent && (
                <span style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  background: '#6366f1', color: '#fff', padding: '4px 12px',
                  borderRadius: '0 0 10px 10px', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Recommended
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: planColor }}>{PLAN_ICONS[plan.id]}</div>
                <h3 className="outfit" style={{ margin: 0 }}>{plan.name}</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{formatPrice(plan)}</span>
                {plan.id !== 'FREE' && <span style={{ color: 'rgba(255,255,255,0.3)' }}>/month</span>}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {plan.features?.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
                    <Check size={13} style={{ color: planColor, flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isPopular ? 'primary' : 'secondary'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || plan.id === 'FREE'}
                loading={busyPlan === plan.id}
                style={{ marginTop: 'auto' }}
              >
                {isCurrent ? (
                  <><Check size={15} /> Current plan</>
                ) : plan.id === 'FREE' ? (
                  'Free forever'
                ) : (
                  <>Upgrade to {plan.name} <ArrowRight size={14} /></>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Payment History */}
      {sub?.history?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '2.5rem', paddingBottom: '2rem' }}
        >
          <h2 className="outfit" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem', marginBottom: '1rem' }}>
            <Receipt size={20} /> Payment History
          </h2>
          <div className="glass" style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Gateway</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sub.history.map(h => (
                  <tr key={h.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />
                        {new Date(h.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 6,
                        background: `${PLAN_COLORS[h.plan] || '#6366f1'}12`,
                        color: PLAN_COLORS[h.plan] || '#6366f1',
                        fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {h.plan}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ textTransform: 'capitalize', color: 'rgba(255,255,255,0.5)' }}>
                        {h.gateway || 'Razorpay'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700 }}>
                        {h.currency === 'inr' ? '₹' : '$'}{Number(h.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: h.status === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                        color: h.status === 'ACTIVE' ? '#4ade80' : '#fbbf24'
                      }}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}
    </div>
  );
};

const thStyle = { textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const tdStyle = { padding: '12px 16px', fontSize: 14 };

export default Billing;
