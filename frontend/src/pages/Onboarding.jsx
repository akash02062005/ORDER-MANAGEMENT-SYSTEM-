import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Globe, ArrowRight, ArrowLeft, Check,
  Package, Zap, ShoppingBag, Briefcase, Truck, Heart,
  Code, GraduationCap, DollarSign, Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const INDUSTRIES = [
  { value: 'ecommerce', label: 'E-Commerce', icon: <ShoppingBag size={20} /> },
  { value: 'saas', label: 'SaaS / Tech', icon: <Code size={20} /> },
  { value: 'retail', label: 'Retail / POS', icon: <Package size={20} /> },
  { value: 'logistics', label: 'Logistics', icon: <Truck size={20} /> },
  { value: 'healthcare', label: 'Healthcare', icon: <Heart size={20} /> },
  { value: 'education', label: 'Education', icon: <GraduationCap size={20} /> },
  { value: 'finance', label: 'Finance', icon: <DollarSign size={20} /> },
  { value: 'other', label: 'Other', icon: <Briefcase size={20} /> },
];

const TEAM_SIZES = ['Just me', '2-5', '6-20', '21-50', '51-200', '200+'];
const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    industry: '',
    size: '',
    currency: 'INR',
    website: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const steps = [
    { title: 'Name your workspace', subtitle: 'This is how your team will identify your organization' },
    { title: 'What industry are you in?', subtitle: 'We\'ll customize your experience based on this' },
    { title: 'How big is your team?', subtitle: 'This helps us set up the right plan for you' },
    { title: 'Final details', subtitle: 'Almost there! Just a couple more things' },
  ];

  const canProceed = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.industry !== '';
    if (step === 2) return form.size !== '';
    return true;
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      await api.post('/organizations', form);
      await refreshUser();
      toast.success('Your workspace is ready!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      <motion.div
        style={styles.container}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={styles.header}>
          <div style={styles.logo}>
            <Rocket size={24} style={{ color: 'hsl(var(--primary))' }} />
            <span className="outfit" style={{ fontSize: '1.25rem', fontWeight: 800 }}>OrderStream</span>
          </div>
          <div style={styles.progress}>
            {steps.map((_, i) => (
              <div key={i} style={{ ...styles.dot, background: i <= step ? 'hsl(var(--primary))' : 'var(--border)' }} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            style={styles.body}
          >
            <h2 className="outfit" style={styles.title}>{steps[step].title}</h2>
            <p style={styles.subtitle}>{steps[step].subtitle}</p>

            {step === 0 && (
              <div style={styles.fieldWrap}>
                <div style={styles.inputGroup}>
                  <Building2 size={20} style={{ color: 'var(--text-dim)' }} />
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Acme Corp, My Store"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={styles.grid}>
                {INDUSTRIES.map((ind) => (
                  <motion.button
                    key={ind.value}
                    style={{
                      ...styles.optionCard,
                      borderColor: form.industry === ind.value ? 'hsl(var(--primary))' : 'var(--border)',
                      background: form.industry === ind.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-glass)',
                    }}
                    onClick={() => setForm({ ...form, industry: ind.value })}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div style={{ color: form.industry === ind.value ? 'hsl(var(--primary))' : 'var(--text-dim)' }}>
                      {ind.icon}
                    </div>
                    <span style={{ fontWeight: 600 }}>{ind.label}</span>
                    {form.industry === ind.value && <Check size={16} style={{ color: 'hsl(var(--primary))', position: 'absolute', top: 8, right: 8 }} />}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TEAM_SIZES.map((sz) => (
                  <motion.button
                    key={sz}
                    style={{
                      ...styles.optionCard,
                      borderColor: form.size === sz ? 'hsl(var(--primary))' : 'var(--border)',
                      background: form.size === sz ? 'rgba(99,102,241,0.1)' : 'var(--bg-glass)',
                    }}
                    onClick={() => setForm({ ...form, size: sz })}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Users size={18} style={{ color: form.size === sz ? 'hsl(var(--primary))' : 'var(--text-dim)' }} />
                    <span style={{ fontWeight: 600 }}>{sz}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Preferred currency</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.value}
                      style={{
                        ...styles.pill,
                        borderColor: form.currency === c.value ? 'hsl(var(--primary))' : 'var(--border)',
                        background: form.currency === c.value ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: form.currency === c.value ? 'hsl(var(--primary))' : 'var(--text-dim)',
                      }}
                      onClick={() => setForm({ ...form, currency: c.value })}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <label style={{ ...styles.label, marginTop: '1.5rem' }}>Website (optional)</label>
                <div style={styles.inputGroup}>
                  <Globe size={20} style={{ color: 'var(--text-dim)' }} />
                  <input
                    style={styles.input}
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={styles.footer}>
          {step > 0 ? (
            <button style={styles.backBtn} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button style={styles.skipBtn} onClick={() => navigate('/')}>
              Skip for now
            </button>
          )}
          <motion.button
            style={{
              ...styles.nextBtn,
              opacity: canProceed() ? 1 : 0.5,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
            disabled={!canProceed() || loading}
            onClick={handleNext}
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            {loading ? 'Setting up...' : step === 3 ? 'Launch Workspace' : 'Continue'}
            {!loading && <ArrowRight size={16} />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-main)',
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  blob1: {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
    top: '-200px', right: '-200px',
  },
  blob2: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)',
    bottom: '-150px', left: '-150px',
  },
  container: {
    width: '100%',
    maxWidth: 640,
    background: 'var(--bg-card)',
    borderRadius: 28,
    border: '1px solid var(--border)',
    padding: '2.5rem',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '2.5rem',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  progress: { display: 'flex', gap: '0.5rem' },
  dot: { width: 32, height: 4, borderRadius: 4, transition: 'all 0.3s' },
  body: { minHeight: 280 },
  title: { fontSize: '1.75rem', margin: 0, color: 'var(--text-main)' },
  subtitle: { color: 'var(--text-dim)', margin: '0.5rem 0 2rem', fontSize: '0.95rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem',
  },
  optionCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)',
    cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
    color: 'var(--text-main)', background: 'none',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  inputGroup: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1rem 1.25rem', borderRadius: 14,
    border: '1px solid var(--border)', background: 'var(--bg-glass)',
  },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: 'var(--text-main)', fontSize: '1rem',
  },
  label: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' },
  pill: {
    padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid var(--border)',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'none', border: 'none', color: 'var(--text-dim)',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
  },
  skipBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', fontSize: '0.85rem',
  },
  nextBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'hsl(var(--primary))', color: '#fff',
    padding: '0.75rem 1.75rem', borderRadius: 14, border: 'none',
    fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
  },
};

export default Onboarding;
