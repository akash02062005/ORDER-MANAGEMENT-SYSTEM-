import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, TrendingUp, Package, CreditCard, Users, ArrowRight,
  Star, Check, Sparkles, BarChart3, Globe, Truck, Building2, Lock, Clock
} from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <TrendingUp />, title: 'Smart Analytics', desc: 'AI-powered insights with forecasting, cohort analysis, and revenue tracking' },
  { icon: <Package />, title: 'Inventory Sync', desc: 'Real-time stock tracking with low-stock alerts and multi-warehouse support' },
  { icon: <CreditCard />, title: 'Global Payments', desc: 'Accept cards, UPI, and wallets via Razorpay payment integration' },
  { icon: <Users />, title: 'Team Collaboration', desc: 'Role-based access control with admin, manager, and viewer permissions' },
  { icon: <Zap />, title: 'Workflow Automation', desc: 'Auto-invoicing, shipment tracking, email notifications, and webhooks' },
  { icon: <Shield />, title: 'Enterprise Security', desc: 'OAuth2 authentication, JWT tokens, audit logs, and encryption at rest' },
];

const plans = [
  { name: 'Starter', price: 0, features: ['Up to 100 orders/mo', '1 user', 'Basic analytics', 'Email support'] },
  { name: 'Growth', price: 2499, features: ['Unlimited orders', '10 users', 'AI insights', 'Priority support', 'All integrations', 'Multi-currency'], popular: true },
  { name: 'Enterprise', price: 7999, features: ['Unlimited everything', 'White-label', 'Custom workflows', 'Dedicated manager', 'SLA guarantee', 'API access'] },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'CEO, TechRetail', quote: 'OrderStream transformed how we manage operations. Our team saves 15 hours a week.' },
  { name: 'Vikram Desai', role: 'Ops Manager, CloudMart', quote: 'The real-time analytics alone paid for our subscription within the first month.' },
  { name: 'Ananya K.', role: 'Founder, NexusShop', quote: 'Moving from spreadsheets to OrderStream was the best decision we made this year.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(165, 180, 252, 0.6)';
        ctx.fill();
      });
      particles.forEach((p1, i) => particles.slice(i + 1).forEach(p2 => {
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(99, 102, 241, ${1 - d / 120})`;
          ctx.lineWidth = 0.5; ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="particles-canvas" />
      <nav className="land-nav">
        <div className="brand outfit">OrderStream<span>.</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Customers</a>
          <button className="nav-cta-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-cta" onClick={() => navigate('/register')}>Start Free</button>
        </div>
      </nav>

      <section className="hero">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div className="hero-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
            <Sparkles size={14} /> Now with Razorpay payments & OAuth login
          </motion.div>
          <h1 className="outfit">The complete <span className="grad">operating system</span> for modern business</h1>
          <p>Manage orders, inventory, customers, payments, analytics, and team collaboration in one powerful SaaS platform. Built for businesses that want to scale.</p>
          <div className="hero-ctas">
            <motion.button className="cta-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/register')}>
              Start Free Trial <ArrowRight size={16} />
            </motion.button>
            <motion.button className="cta-ghost" whileHover={{ scale: 1.05 }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See Features
            </motion.button>
          </div>
          <div className="hero-stats">
            <div><h3 className="outfit">10K+</h3><span>Businesses</span></div>
            <div><h3 className="outfit">₹2.4B</h3><span>Processed</span></div>
            <div><h3 className="outfit">99.99%</h3><span>Uptime</span></div>
            <div><h3 className="outfit">4.9★</h3><span>G2 Rating</span></div>
          </div>
        </motion.div>
      </section>

      {/* Trust bar */}
      <section style={{ textAlign: 'center', padding: '2rem 0 4rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Trusted by teams across India and 34+ countries
        </p>
      </section>

      <section className="features" id="features">
        <motion.h2 className="outfit" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>Everything you need. Nothing you don't.</motion.h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: '-1rem', marginBottom: '3rem', maxWidth: 600, margin: '-1rem auto 3rem' }}>
          One platform to replace your spreadsheets, order trackers, and payment tools.
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feat-card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(99,102,241,.3)' }}>
              <div className="feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="outfit" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Up and running in 3 minutes</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>No credit card required. No complex setup.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { num: '01', title: 'Sign up', desc: 'Create your account with Google, GitHub, or email', icon: <Lock size={24} /> },
            { num: '02', title: 'Set up workspace', desc: 'Name your org, pick your industry, invite your team', icon: <Building2 size={24} /> },
            { num: '03', title: 'Start managing', desc: 'Add products, take orders, and watch insights roll in', icon: <BarChart3 size={24} /> },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(99,102,241,0.15)', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{step.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.8rem' }}>{step.num}</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials" style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="outfit" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Loved by growing teams</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ padding: '2rem', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, flex: 1, fontSize: '0.95rem' }}>"{t.quote}"</p>
              <div>
                <b>{t.name}</b>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pricing" id="pricing">
        <h2 className="outfit">Simple pricing, no surprises</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: '-0.5rem', marginBottom: '2rem' }}>
          Start free, upgrade when you're ready
        </p>
        <div className="plans-grid">
          {plans.map((p, i) => (
            <motion.div key={i} className={`plan-card glass ${p.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -8 }}>
              {p.popular && <span className="pop-badge"><Star size={10} /> Most Popular</span>}
              <h3 className="outfit">{p.name}</h3>
              <div className="plan-price">₹{p.price.toLocaleString()}<span>/mo</span></div>
              <ul>{p.features.map((ft, j) => <li key={j}><Check size={14} /> {ft}</li>)}</ul>
              <button className={p.popular ? 'cta-primary' : 'cta-ghost'} onClick={() => navigate('/register')}>
                {p.price === 0 ? 'Start Free' : `Choose ${p.name}`} <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="outfit" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to streamline your operations?</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            Join 10,000+ businesses already using OrderStream to manage and grow their operations.
          </p>
          <motion.button
            className="cta-primary"
            style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
          >
            Start Your Free Trial <ArrowRight size={18} />
          </motion.button>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            No credit card required. 14-day free trial on all paid plans.
          </p>
        </motion.div>
      </section>

      <footer className="land-foot">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>© 2026 OrderStream. Built for modern businesses.</p>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)' }}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)' }}>Terms</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
