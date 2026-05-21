import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import AnimatedCard from '../components/ui/AnimatedCard';
import './AIInsights.css';

const suggestions = [
  'Which products are low on stock?',
  'How many orders are pending today?',
  'How do I add a new product?',
  'Show me revenue insights',
  'How do I set up payment gateways?',
  'How do I invite team members?',
];

const insights = [
  { icon: <TrendingUp />, color: '#10b981', title: 'Revenue up 18%', text: 'Electronics category drove 42% of growth this month' },
  { icon: <AlertCircle />, color: '#f59e0b', title: '3 SKUs running low', text: 'Reorder items with stock below 10 units from Inventory page' },
  { icon: <Lightbulb />, color: '#6366f1', title: 'Upsell opportunity', text: 'Customers who bought earbuds rarely buy headphones — run a targeted campaign' },
  { icon: <Zap />, color: '#ec4899', title: 'Retention alert', text: 'Some high-value customers have not ordered in 45+ days — send a win-back offer' },
];

const generateResponse = (q) => {
    const lower = q.toLowerCase();

    // Products
    if (lower.includes('add') && (lower.includes('product') || lower.includes('item'))) {
        return 'To add a product: go to the "Products" page from the sidebar, then click the "New Product" button at the top right. Fill in the product name, category, price, stock quantity, and optionally an image URL. Click "Add Product" to save it to the database instantly.';
    }
    if (lower.includes('delete') && lower.includes('product')) {
        return 'To delete a product: go to Products → find the product row → click the red trash icon on the right side. You will be asked to confirm before it is permanently deleted.';
    }
    if (lower.includes('edit') && lower.includes('product')) {
        return 'To edit a product: go to Products → click the blue edit (pencil) icon on the product row → update any fields → click "Save Changes".';
    }
    if (lower.includes('low') && (lower.includes('stock') || lower.includes('inventory'))) {
        return 'Products with fewer than 10 units show a "Low Stock" badge in red on the Products page. You can also see a low-stock alert card here in AI Insights. To restock, edit the product and update the stock quantity.';
    }
    if (lower.includes('product') || lower.includes('inventory') || lower.includes('catalog')) {
        return 'Your product catalog is managed from the Products page. You can add, edit, and delete products there. Each product has a name, category, price, stock count, and optional image. Products with fewer than 10 units are flagged as "Low Stock" automatically.';
    }

    // Orders
    if (lower.includes('add') && lower.includes('order')) {
        return 'To create a new order: go to the "Orders" page → click "New Order" at the top right → enter the customer name, order amount, status, and optionally list items separated by commas → click "Create Order".';
    }
    if (lower.includes('pending') && lower.includes('order')) {
        return 'Pending orders are visible on the Orders page — filter by "Pending" using the status dropdown. Each pending order has a "Truck" button to mark it as Shipped, and an "X" to cancel it.';
    }
    if (lower.includes('ship') || lower.includes('deliver')) {
        return 'To update an order status: go to Orders → find the order → use the action buttons: Truck icon marks it Shipped, Checkmark marks it Delivered. You can also cancel with the X button.';
    }
    if (lower.includes('order')) {
        return 'The Orders page shows all your orders in real-time. You can filter by status (Pending, Shipped, Delivered, Cancelled), search by customer name or order ID, view full details, update the status, or create new orders with the "New Order" button.';
    }

    // Customers
    if (lower.includes('add') && lower.includes('customer')) {
        return 'To add a customer: go to the "Customers" page → click "Add Customer" → fill in name, email, phone, and address → click "Add Customer" to save. The customer will appear in your directory immediately.';
    }
    if (lower.includes('delete') && lower.includes('customer')) {
        return 'To delete a customer: go to Customers → find their card → click the red trash icon → confirm the deletion. Note: this does not delete their order history.';
    }
    if (lower.includes('customer')) {
        return 'The Customers page shows all your customers as cards. You can add new customers, edit their details, view their full profile (including order count), search by name, email or city, and delete inactive ones.';
    }

    // Revenue / Analytics
    if (lower.includes('revenue') || lower.includes('sales') || lower.includes('earning')) {
        return 'Your revenue data is on the Analytics and Dashboard pages. The Dashboard shows this week\'s revenue chart, top customers, and order status breakdown. The Analytics page has detailed reports with revenue by day, week, and month.';
    }
    if (lower.includes('analytics') || lower.includes('report')) {
        return 'Go to Analytics in the sidebar for detailed revenue charts, order trends, customer growth, and sales by category. Reports can be viewed in different date ranges. The Reports page also lets you export data.';
    }
    if (lower.includes('forecast') || lower.includes('predict')) {
        return 'Based on current trends, revenue growth is tracking at ~18% month-over-month. To view trends, check the Analytics page. For custom forecasts, use the Reports page where you can export data to analyze externally.';
    }

    // Payments / Billing
    if (lower.includes('razorpay') || lower.includes('payment gateway') || lower.includes('upi') || lower.includes('inr')) {
        return 'To configure Razorpay: add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to application.properties (or as environment variables). Then restart the backend. Customers can pay via UPI, cards, or netbanking from the Billing page.';
    }
    if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscribe') || lower.includes('plan')) {
        return 'Go to Billing in the sidebar to manage your subscription. You can choose from Starter (Free), Growth (₹2,499/mo), or Enterprise (₹7,999/mo). Payments are processed via Razorpay (UPI, cards, netbanking).';
    }

    // Settings / Profile
    if (lower.includes('password') || lower.includes('change password')) {
        return 'To change your password: go to Settings → click "Security" in the left menu → enter your current password and new password → click "Change Password". Passwords must be at least 8 characters.';
    }
    if (lower.includes('profile') || lower.includes('name') || lower.includes('email')) {
        return 'To update your profile: go to Settings → "Profile Settings" → update your name or email → click "Save Profile". Your username cannot be changed after registration.';
    }
    if (lower.includes('notification') || lower.includes('alert')) {
        return 'Notification preferences are in Settings → Notifications. You can toggle alerts for new orders, new customers, low stock, payment events, and weekly reports. The bell icon in the top navbar shows live notifications from your backend.';
    }
    if (lower.includes('theme') || lower.includes('dark') || lower.includes('light')) {
        return 'To change the theme: go to Settings → Appearance & Language → click "Switch to Light/Dark". You can also click the sun/moon icon in the top navbar for a quick toggle.';
    }
    if (lower.includes('language') || lower.includes('hindi') || lower.includes('tamil')) {
        return 'The interface supports English, Hindi, Tamil, Telugu, and Bengali. Go to Settings → Appearance & Language → select your preferred language. You can also click the Globe icon in the navbar to switch quickly.';
    }
    if (lower.includes('setting')) {
        return 'The Settings page has four sections: Profile (name, email), Security (password, 2FA), Notifications (toggle alerts), and Appearance (theme, language). Click each section in the left menu to configure it.';
    }

    // Team
    if (lower.includes('team') || lower.includes('member') || lower.includes('invite')) {
        return 'Go to the Team page from the sidebar to manage your team. You can invite members by email, assign roles (Admin, Manager, Customer), and see all active team members. Roles control what each member can see and do in the system.';
    }

    // Integrations
    if (lower.includes('integration') || lower.includes('shopify') || lower.includes('slack') || lower.includes('zapier')) {
        return 'Go to Integrations in the sidebar to connect your tools. You can connect Razorpay, Shopify, Slack, SendGrid, QuickBooks, Zapier, and more with one click. Each integration shows its connection status and category.';
    }

    // OAuth / Login
    if (lower.includes('google login') || lower.includes('github login') || lower.includes('oauth') || lower.includes('social login')) {
        return 'To enable Google/GitHub login: register OAuth2 apps on Google Cloud Console and GitHub Developer Settings, then add the client ID and secret to application.properties (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET). Restart the backend after updating.';
    }
    if (lower.includes('otp') || lower.includes('magic link') || lower.includes('email verification')) {
        return 'OTP and magic link emails are sent via Resend API. Set your RESEND_API_KEY in the backend .env file. Get a free API key at https://resend.com/signup (100 emails/day free). No SMTP setup needed.';
    }
    if (lower.includes('register') || lower.includes('sign up') || lower.includes('signup')) {
        return 'Users can register at /register with a username, email, and password. After registration, new accounts are auto-verified. Google and GitHub social login are also available once OAuth2 credentials are configured in the backend.';
    }

    // Dashboard
    if (lower.includes('dashboard')) {
        return 'The Dashboard gives you a real-time overview: total revenue, orders, customers, and average order value — all pulled live from your MongoDB database. It also shows a revenue chart, order status breakdown, and top customers by spend.';
    }

    // Invoices
    if (lower.includes('invoice')) {
        return 'The Invoices page lets you view and manage all invoices. Invoices are auto-generated when orders are placed. You can search, filter, and view invoice details from there.';
    }

    // Shipping
    if (lower.includes('ship') || lower.includes('shipment')) {
        return 'The Shipments page tracks all order shipments. When you mark an order as "Shipped" from the Orders page, a shipment record is created automatically. You can track carrier info and update delivery status from the Shipments page.';
    }

    // Generic help
    if (lower.includes('help') || lower.includes('how') || lower.includes('what') || lower.includes('where')) {
        return 'I can help you with: adding/editing products, managing customers and orders, setting up payments (Razorpay), configuring OAuth login, updating your profile, managing team members, and reading analytics. What would you like to know?';
    }

    return 'Great question! I can answer questions about products, orders, customers, payments, settings, integrations, team management, and analytics. Try asking something like "How do I add a product?" or "How do I set up Razorpay?"';
};

const AIInsights = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m your AI business assistant. I can answer questions about your products, orders, customers, payments, settings, and more. What would you like to know?' }
    ]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = (text) => {
        const q = (text || input).trim();
        if (!q) return;
        setMessages(m => [...m, { role: 'user', text: q }]);
        setInput('');
        setThinking(true);
        setTimeout(() => {
            setMessages(m => [...m, { role: 'assistant', text: generateResponse(q) }]);
            setThinking(false);
        }, 900);
    };

    const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

    return (
        <motion.div className="ai-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="page-header">
                <div>
                    <h1 className="outfit"><Sparkles size={26} /> AI Insights</h1>
                    <p>Ask me anything about your business, products, orders, or settings</p>
                </div>
            </header>

            <div className="insights-grid">
                {insights.map((ins, i) => (
                    <motion.div key={i} className="ins-card glass"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <div className="ins-icon" style={{ background: `${ins.color}22`, color: ins.color }}>{ins.icon}</div>
                        <div><b>{ins.title}</b><p>{ins.text}</p></div>
                    </motion.div>
                ))}
            </div>

            <AnimatedCard title="Ask your AI assistant" subtitle="Products, orders, payments, settings — ask anything" className="chat-card">
                <div className="chat-area">
                    <div className="messages">
                        <AnimatePresence>
                            {messages.map((m, i) => (
                                <motion.div key={i} className={`msg ${m.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="msg-avatar">{m.role === 'user' ? <User size={16} /> : <Bot size={16} />}</div>
                                    <div className="msg-bubble">{m.text}</div>
                                </motion.div>
                            ))}
                            {thinking && (
                                <motion.div className="msg assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="msg-avatar"><Bot size={16} /></div>
                                    <div className="msg-bubble typing"><span></span><span></span><span></span></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={endRef} />
                    </div>
                    <div className="suggestions">
                        {suggestions.map(s => <button key={s} className="sug" onClick={() => send(s)}>{s}</button>)}
                    </div>
                    <div className="chat-input-row">
                        <input
                            className="chat-input glass"
                            placeholder="Ask about products, orders, payments, settings..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                        />
                        <button className="send-btn" onClick={() => send()} disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </AnimatedCard>
        </motion.div>
    );
};

export default AIInsights;
