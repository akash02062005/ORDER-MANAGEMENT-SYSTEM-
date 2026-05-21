import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, MessageSquare, BookOpen, ExternalLink, Mail, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

const HelpCenter = () => {
    const { t } = useTranslation();
    const [selectedGuide, setSelectedGuide] = useState(null);

    const guideContent = {
        'User Guides': {
            icon: <BookOpen className="text-primary" />,
            title: t('user_guides'),
            sections: [
                { title: t('guide_gs'), content: t('guide_gs_desc') },
                { title: t('guide_om'), content: t('guide_om_desc') },
                { title: t('guide_ic'), content: t('guide_ic_desc') }
            ]
        },
        'Community': {
            icon: <MessageSquare className="text-secondary" />,
            title: t('community'),
            sections: [
                { title: t('community_forums'), content: t('community_forums_desc') },
                { title: t('feature_requests'), content: t('feature_requests_desc') }
            ]
        },
        'API Reference': {
            icon: <ExternalLink className="text-accent" />,
            title: t('api_ref'),
            sections: [
                { title: t('api_auth'), content: t('api_auth_desc') },
                { title: t('api_endpoints'), content: t('api_endpoints_desc') }
            ]
        }
    };

    const FAQs = [
        { q: t('faq_q1'), a: t('faq_a1') },
        { q: t('faq_q2'), a: t('faq_a2') },
        { q: t('faq_q3'), a: t('faq_a3') },
        { q: t('faq_q4'), a: t('faq_a4') },
    ];

    const resources = [
        { title: 'User Guides', desc: t('user_guides_desc'), icon: <BookOpen />, color: 'primary' },
        { title: 'Community', desc: t('community_desc'), icon: <MessageSquare />, color: 'secondary' },
        { title: 'API Reference', desc: t('api_ref_desc'), icon: <ExternalLink />, color: 'accent' },
    ];

    return (
        <div className="main-content animate-fade-in">
             <header className="page-header">
                <div className="header-text">
                    <h1 className="outfit">{t('help')}</h1>
                    <p>{t('how_can_help')}</p>
                </div>
                <Button variant="primary">
                   <Mail size={18} /> {t('contact_support')}
                </Button>
            </header>

            <div className="help-hero glass">
                <div className="hero-content">
                    <HelpCircle size={48} className="text-primary" />
                    <h2 className="outfit">{t('how_can_help')}</h2>
                    <div className="search-wrapper glass">
                        <input type="text" placeholder={t('search_help_placeholder')} />
                    </div>
                </div>
            </div>

            <div className="resources-grid">
                {resources.map((res, i) => (
                    <motion.div 
                        key={i} 
                        className="resource-card glass"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`res-icon-bg bg-${res.color}`}>{res.icon}</div>
                        <h3 className="outfit">{t(res.title.toLowerCase().replace(' ', '_'))}</h3>
                        <p>{res.desc}</p>
                        <button 
                            className="text-btn" 
                            onClick={() => setSelectedGuide(guideContent[res.title])}
                        >
                            {t('read_more')} <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="faq-section glass">
                <h3 className="outfit">{t('faqs')}</h3>
                <div className="faq-list">
                    {FAQs.map((faq, i) => (
                        <div key={i} className="faq-item">
                            <h4 className="outfit">{faq.q}</h4>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guide Detail Modal */}
            <AnimatePresence>
                {selectedGuide && (
                    <div className="modal-overlay" onClick={() => setSelectedGuide(null)}>
                        <motion.div 
                            className="guide-modal glass"
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="guide-header">
                                <div className="guide-badge">{selectedGuide.icon}</div>
                                <div className="guide-title-box">
                                    <h2 className="outfit">{selectedGuide.title}</h2>
                                    <p>Official Reference Documentation</p>
                                </div>
                                <button className="close-circle" onClick={() => setSelectedGuide(null)}><X size={20} /></button>
                            </div>
                            
                            <div className="guide-content">
                                {selectedGuide.sections.map((section, i) => (
                                    <div key={i} className="guide-doc-item">
                                        <div className="doc-num">0{i+1}</div>
                                        <div className="doc-text">
                                            <h4 className="outfit">{section.title}</h4>
                                            <p>{section.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="guide-footer">
                                <Button variant="secondary" onClick={() => setSelectedGuide(null)}>Done</Button>
                                <Button variant="primary">Download PDF <ArrowRight size={16} /></Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .help-hero {
                    padding: 4rem 2rem;
                    border-radius: 24px;
                    text-align: center;
                    margin-top: 2rem;
                    background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 100%, rgba(139, 92, 246, 0.05) 100%);
                }
                .hero-content { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }
                .help-hero h2 { font-size: 2.25rem; }
                .help-hero .search-wrapper { width: 100%; max-width: 500px; padding: 1rem; border-radius: 12px; }
                .help-hero input { background: none; width: 100%; border: none; outline: none; color: var(--text-main); font-size: 1rem; }
                
                .resources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin: 2rem 0; }
                .resource-card { padding: 2rem; border-radius: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .res-icon-bg { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; }
                .bg-primary { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
                .bg-secondary { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); }
                .bg-accent { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); }
                .resource-card p { font-size: 0.9rem; color: var(--text-dim); }
                .text-btn { color: hsl(var(--primary)); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; background: none; border: none; cursor: pointer; transition: var(--transition); }
                .text-btn:hover { opacity: 0.7; transform: translateX(5px); }

                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .guide-modal { width: 100%; max-width: 700px; padding: 3rem; border-radius: 32px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4); border: 1px solid var(--glass-border); position: relative; }
                .guide-header { display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2.5rem; }
                .guide-badge { width: 64px; height: 64px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .guide-title-box h2 { font-size: 2rem; margin-bottom: 0.25rem; color: var(--text-main); }
                .guide-title-box p { font-size: 0.8rem; color: hsl(var(--primary)); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
                .close-circle { position: absolute; top: 2rem; right: 2rem; width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: var(--text-dim); cursor: pointer; border: none; }
                
                .guide-content { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem; }
                .guide-doc-item { display: flex; gap: 1.5rem; padding: 1.5rem; border-radius: 16px; transition: var(--transition); background: rgba(255, 255, 255, 0.02); }
                .guide-doc-item:hover { background: rgba(255, 255, 255, 0.04); transform: translateX(10px); }
                .doc-num { font-size: 1.5rem; font-weight: 800; color: rgba(255, 255, 255, 0.1); font-family: 'Outfit'; }
                .doc-text h4 { font-size: 1.125rem; margin-bottom: 0.5rem; color: var(--text-main); }
                .doc-text p { font-size: 0.9375rem; color: var(--text-dim); line-height: 1.6; }
                .guide-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); }

                .faq-section { padding: 2.5rem; border-radius: 24px; }
                .faq-section h3 { margin-bottom: 2rem; font-size: 1.5rem; }
                .faq-list { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .faq-item h4 { margin-bottom: 0.75rem; color: var(--text-main); }
                .faq-item p { color: var(--text-dim); font-size: 0.9rem; line-height: 1.6; }
            `}} />
        </div>
    );
};

export default HelpCenter;
