import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle2, X, Shield, Loader2, Wallet, Building2, Zap, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { openRazorpayCheckout, loadRazorpayScript } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import './PaymentModal.css';

/**
 * Enhanced payment modal with Razorpay live integration.
 * Now supports:
 * 1. Live Razorpay checkout (preferred)
 * 2. Demo simulation fallback (card, UPI, net banking)
 */
const luhnOk = (num) => {
  const s = num.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0, dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
};

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

const PaymentModal = ({ open, amount = 0, currency = 'INR', planName = 'Pro', planId, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState('choose'); // choose | razorpay | demo
  const [tab, setTab] = useState('card');
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', name: '', expiry: '', cvc: '' });
  const [upi, setUpi] = useState('demo@okhdfcbank');
  const [bank, setBank] = useState('HDFC');
  const [step, setStep] = useState('form');
  const [err, setErr] = useState('');
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  useEffect(() => {
    if (open) { setStep('form'); setErr(''); setMode('choose'); }
  }, [open]);

  const handleRazorpayPay = async () => {
    setRazorpayLoading(true);
    try {
      const result = await openRazorpayCheckout({
        plan: planId || planName.toUpperCase(),
        user,
        onSuccess: (response) => {
          toast.success(`Payment successful!`);
          onSuccess?.({ txnId: response.razorpay_payment_id || 'confirmed', amount, currency, method: 'razorpay' });
        },
        onFailure: (reason) => {
          if (reason !== 'cancelled') toast.error('Payment failed: ' + reason);
        },
      });
      if (result?.ok) {
        onClose?.();
      }
    } catch (err) {
      toast.error(err.message || 'Could not open Razorpay checkout');
    } finally {
      setRazorpayLoading(false);
    }
  };

  const validate = () => {
    if (tab === 'card') {
      if (!luhnOk(card.number)) return 'Invalid card number';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Expiry must be MM/YY';
      if (!/^\d{3,4}$/.test(card.cvc)) return 'CVC is 3-4 digits';
      if (card.name.trim().length < 2) return 'Enter cardholder name';
    } else if (tab === 'upi') {
      if (!/^[\w.-]+@[\w.-]+$/.test(upi)) return 'Invalid UPI ID';
    }
    return '';
  };

  const pay = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr('');
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      const txnId = 'TXN_' + Math.random().toString(36).slice(2, 12).toUpperCase();
      toast.success(`Payment successful! Transaction ${txnId}`);
      setTimeout(() => onSuccess?.({ txnId, amount, currency, method: tab }), 1400);
    }, 1800);
  };

  const fmt = (n) => {
    const cur = currency.toUpperCase() === 'INR' ? 'INR' : 'USD';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur }).format(n);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="pay-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="pay-modal"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
            <button className="pay-close" onClick={onClose}><X size={16} /></button>

            <AnimatePresence mode="wait">
              {/* ─── Payment Method Chooser ─── */}
              {mode === 'choose' && step === 'form' && (
                <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="pay-header">
                    <div className="pay-logo"><Shield size={20} /></div>
                    <div>
                      <h3>Secure Checkout</h3>
                      <p>{planName} plan — {fmt(amount)}/month</p>
                    </div>
                  </div>

                  <div className="pay-method-cards">
                    <motion.button
                      className="pay-method-card razorpay"
                      onClick={handleRazorpayPay}
                      disabled={razorpayLoading}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="pmc-icon razorpay-icon">
                        <Zap size={20} />
                      </div>
                      <div className="pmc-info">
                        <strong>Pay with Razorpay</strong>
                        <span>UPI, Cards, Net Banking, Wallets</span>
                      </div>
                      <div className="pmc-badge recommended">Recommended</div>
                      {razorpayLoading && <Loader2 className="spin" size={18} style={{ marginLeft: 'auto' }} />}
                    </motion.button>

                    <motion.button
                      className="pay-method-card demo"
                      onClick={() => setMode('demo')}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="pmc-icon demo-icon">
                        <CreditCard size={20} />
                      </div>
                      <div className="pmc-info">
                        <strong>Demo Payment</strong>
                        <span>Simulated checkout (no real charges)</span>
                      </div>
                      <div className="pmc-badge demo-badge">Test</div>
                    </motion.button>
                  </div>

                  <div className="pay-foot">
                    <Shield size={11} /> 256-bit encrypted · PCI-DSS compliant
                  </div>
                </motion.div>
              )}

              {/* ─── Demo Payment Form ─── */}
              {mode === 'demo' && step === 'form' && (
                <motion.div key="demo-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="pay-header">
                    <div className="pay-logo"><CreditCard size={20} /></div>
                    <div>
                      <h3>Demo Checkout</h3>
                      <p>{planName} plan · no real charges</p>
                    </div>
                  </div>

                  <motion.div className="pay-card-visual"
                    initial={{ rotateY: -10 }} animate={{ rotateY: 0 }}
                    transition={{ type: 'spring' }}>
                    <div className="chip"></div>
                    <div className="brand">VISA</div>
                    <div className="num">{card.number || '•••• •••• •••• ••••'}</div>
                    <div className="row">
                      <div><span>CARDHOLDER</span><strong>{card.name || 'YOUR NAME'}</strong></div>
                      <div><span>EXPIRES</span><strong>{card.expiry || 'MM/YY'}</strong></div>
                    </div>
                    <div className="shine"></div>
                  </motion.div>

                  <div className="pay-tabs">
                    <button className={tab === 'card' ? 'active' : ''} onClick={() => setTab('card')}><CreditCard size={14} /> Card</button>
                    <button className={tab === 'upi' ? 'active' : ''} onClick={() => setTab('upi')}><Wallet size={14} /> UPI</button>
                    <button className={tab === 'netbanking' ? 'active' : ''} onClick={() => setTab('netbanking')}><Building2 size={14} /> Net Banking</button>
                  </div>

                  {tab === 'card' && (
                    <div className="pay-fields">
                      <label>Card number
                        <input value={card.number} onChange={e => setCard({ ...card, number: formatCard(e.target.value) })} placeholder="1234 5678 9012 3456" />
                      </label>
                      <label>Cardholder name
                        <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="YOUR NAME" />
                      </label>
                      <div className="pay-row">
                        <label>Expiry
                          <input value={card.expiry} onChange={e => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                            setCard({ ...card, expiry: v });
                          }} placeholder="MM/YY" />
                        </label>
                        <label>CVC
                          <input value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" type="password" />
                        </label>
                      </div>
                    </div>
                  )}

                  {tab === 'upi' && (
                    <div className="pay-fields">
                      <label>UPI ID
                        <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="name@bank" />
                      </label>
                      <p className="hint">Enter your UPI ID to receive a collect request on your payment app.</p>
                    </div>
                  )}

                  {tab === 'netbanking' && (
                    <div className="pay-fields">
                      <label>Select bank
                        <select value={bank} onChange={e => setBank(e.target.value)}>
                          {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank'].map(b => <option key={b}>{b}</option>)}
                        </select>
                      </label>
                      <p className="hint">You'll be redirected to your bank's secure portal (demo only).</p>
                    </div>
                  )}

                  {err && <div className="pay-err">{err}</div>}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="pay-btn-secondary" onClick={() => setMode('choose')}>Back</button>
                    <button className="pay-btn" onClick={pay} style={{ flex: 1 }}>
                      <Lock size={14} /> Pay {fmt(amount)}
                    </button>
                  </div>

                  <div className="pay-foot">
                    <Shield size={11} /> Demo gateway · No real charges
                  </div>
                </motion.div>
              )}

              {/* ─── Processing ─── */}
              {step === 'processing' && (
                <motion.div key="proc" className="pay-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="proc-ring"><Loader2 className="spin" size={40} /></div>
                  <h3>Processing payment</h3>
                  <p>Please don't close this window...</p>
                  <div className="proc-steps">
                    <div className="proc-step done">Authorising payment</div>
                    <div className="proc-step done">Contacting gateway</div>
                    <div className="proc-step active">Confirming transaction</div>
                  </div>
                </motion.div>
              )}

              {/* ─── Success ─── */}
              {step === 'success' && (
                <motion.div key="done" className="pay-center"
                  initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="pay-success-icon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h3>Payment successful!</h3>
                  <p>{fmt(amount)} charged for {planName} plan</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
