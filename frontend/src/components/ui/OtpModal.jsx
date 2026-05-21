import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, RefreshCw, Check, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import './OtpModal.css';

/**
 * Demo OTP verification modal.
 * Generates a real random 6-digit code on mount (or when resent),
 * "sends" it to the user's email (no SMTP — the code is displayed
 * in a demo banner so the flow is end-to-end runnable), and verifies
 * client-side before invoking onVerified().
 */
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const OtpModal = ({ open, email, title = 'Verify your email', subtitle, onVerified, onClose }) => {
  const [code, setCode] = useState(() => generateCode());
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (!open) return;
    const newCode = generateCode();
    setCode(newCode);
    setDigits(['', '', '', '', '', '']);
    setAttempts(0);
    setCooldown(60);
    setError('');
    setSent(false);
    // Simulate "sending" the email
    setTimeout(() => {
      setSent(true);
      console.log(`📧 [DEMO] OTP sent to ${email}: ${newCode}`);
      toast.info(`Verification code sent to ${email}`, { icon: '📧' });
    }, 600);
  }, [open, email]);

  useEffect(() => {
    if (!open || cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, cooldown]);

  const handleDigit = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    setError('');
    if (value && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) {
      verify(next.join(''));
    }
  };

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter') verify(digits.join(''));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length) {
      const arr = text.split('').concat(Array(6 - text.length).fill(''));
      setDigits(arr);
      if (arr.every(d => d !== '')) verify(text);
    }
  };

  const verify = (entered) => {
    setVerifying(true);
    setTimeout(() => {
      if (entered === code) {
        toast.success('Email verified successfully! 🎉');
        setVerifying(false);
        onVerified?.();
      } else {
        setVerifying(false);
        setAttempts(a => a + 1);
        setError('Invalid code. Please try again.');
        setDigits(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    }, 700);
  };

  const resend = () => {
    if (cooldown > 0) return;
    const newCode = generateCode();
    setCode(newCode);
    setDigits(['', '', '', '', '', '']);
    setCooldown(60);
    setError('');
    setSent(false);
    setTimeout(() => {
      setSent(true);
      console.log(`📧 [DEMO] Resent OTP to ${email}: ${newCode}`);
      toast.info('New code sent');
    }, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="otp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="otp-modal glass"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <button className="otp-close" onClick={onClose}><X size={18} /></button>

            <motion.div className="otp-icon-wrap"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}>
              <div className="otp-icon-pulse"></div>
              <div className="otp-icon"><Shield size={32} /></div>
            </motion.div>

            <h2 className="outfit">{title}</h2>
            <p className="otp-sub">{subtitle || <>We sent a 6-digit verification code to <b>{email}</b></>}</p>

            <AnimatePresence>
              {sent && (
                <motion.div className="demo-banner"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}>
                  <Send size={14} />
                  <span>For this demo your code is <b className="otp-demo-code">{code}</b></span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="otp-inputs" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <motion.input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  className={`otp-digit ${d ? 'filled' : ''} ${error ? 'error' : ''}`}
                  whileFocus={{ scale: 1.08 }}
                  animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.35 }}
                />
              ))}
            </div>

            {error && <div className="otp-error">{error} {attempts >= 3 && '(tip: check the demo banner above)'}</div>}

            <button className="otp-verify" disabled={verifying || digits.some(d => !d)} onClick={() => verify(digits.join(''))}>
              {verifying ? <span className="otp-spinner"></span> : <><Check size={16} /> Verify</>}
            </button>

            <div className="otp-resend-row">
              {cooldown > 0 ? (
                <span>Resend code in <b>{cooldown}s</b></span>
              ) : (
                <button onClick={resend}><RefreshCw size={14} /> Resend code</button>
              )}
            </div>

            <div className="otp-foot">
              <Mail size={12} />
              <span>OTP verification · End-to-end demo · No real email sent</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OtpModal;
