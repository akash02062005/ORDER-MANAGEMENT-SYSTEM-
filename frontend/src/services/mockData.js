// Realistic Mock Data for Offline / Demo Mode
export const MOCK_PRODUCTS = [
  { id: 'prod001abc123', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, stock: 142, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop' },
  { id: 'prod002abc123', name: 'Smart Watch V3', category: 'Electronics', price: 8499, stock: 38, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
  { id: 'prod003abc123', name: 'USB-C Hub 7-in-1', category: 'Accessories', price: 1499, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=80&h=80&fit=crop' },
  { id: 'prod004abc123', name: 'Mechanical Keyboard', category: 'Peripherals', price: 4299, stock: 65, imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=80&h=80&fit=crop' },
  { id: 'prod005abc123', name: 'Ergonomic Mouse', category: 'Peripherals', price: 1999, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=80&h=80&fit=crop' },
  { id: 'prod006abc123', name: 'Laptop Stand Pro', category: 'Accessories', price: 1299, stock: 210, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80&h=80&fit=crop' },
  { id: 'prod007abc123', name: 'Portable Charger 20000mAh', category: 'Electronics', price: 2199, stock: 88, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&h=80&fit=crop' },
  { id: 'prod008abc123', name: 'Noise Cancelling Headphones', category: 'Electronics', price: 12999, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
];

export const MOCK_CUSTOMERS = [
  { id: 'cust001', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91-9876543210', city: 'Mumbai', totalOrders: 14, totalSpent: 42800 },
  { id: 'cust002', name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91-9123456789', city: 'Delhi', totalOrders: 7, totalSpent: 18600 },
  { id: 'cust003', name: 'Anjali Mehta', email: 'anjali@example.com', phone: '+91-9988776655', city: 'Bangalore', totalOrders: 22, totalSpent: 91400 },
  { id: 'cust004', name: 'Suresh Patel', email: 'suresh@example.com', phone: '+91-9765432109', city: 'Ahmedabad', totalOrders: 5, totalSpent: 11200 },
  { id: 'cust005', name: 'Deepika Singh', email: 'deepika@example.com', phone: '+91-9543210987', city: 'Chennai', totalOrders: 11, totalSpent: 33500 },
  { id: 'cust006', name: 'Kiran Reddy', email: 'kiran@example.com', phone: '+91-9321098765', city: 'Hyderabad', totalOrders: 19, totalSpent: 68000 },
];

export const MOCK_ORDERS = [
  { id: 'ord001xyz789', customerName: 'Priya Sharma', createdAt: new Date(Date.now() - 2*60*60*1000).toISOString(), totalAmount: 8499, status: 'PENDING', items: [{ productName: 'Smart Watch V3', qty: 1, price: 8499 }] },
  { id: 'ord002xyz789', customerName: 'Rahul Verma', createdAt: new Date(Date.now() - 5*60*60*1000).toISOString(), totalAmount: 4498, status: 'SHIPPED', items: [{ productName: 'Wireless Earbuds Pro', qty: 1, price: 2999 }, { productName: 'USB-C Hub', qty: 1, price: 1499 }] },
  { id: 'ord003xyz789', customerName: 'Anjali Mehta', createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(), totalAmount: 12999, status: 'DELIVERED', items: [{ productName: 'Noise Cancelling Headphones', qty: 1, price: 12999 }] },
  { id: 'ord004xyz789', customerName: 'Suresh Patel', createdAt: new Date(Date.now() - 48*60*60*1000).toISOString(), totalAmount: 5798, status: 'CANCELLED', items: [{ productName: 'Mechanical Keyboard', qty: 1, price: 4299 }, { productName: 'Ergonomic Mouse', qty: 1, price: 1999 }] },
  { id: 'ord005xyz789', customerName: 'Deepika Singh', createdAt: new Date(Date.now() - 1*60*60*1000).toISOString(), totalAmount: 2999, status: 'PENDING', items: [{ productName: 'Wireless Earbuds Pro', qty: 1, price: 2999 }] },
  { id: 'ord006xyz789', customerName: 'Kiran Reddy', createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString(), totalAmount: 23997, status: 'DELIVERED', items: [{ productName: 'Portable Charger', qty: 3, price: 2199 }] },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'order', title: 'New Order Received', desc: 'Order #ORD001 placed by Priya Sharma — 8,499', time: '2 mins ago', read: false },
  { id: 'n2', type: 'user', title: 'New Customer Registered', desc: 'Kiran Reddy joined from Hyderabad', time: '1 hour ago', read: false },
  { id: 'n3', type: 'success', title: 'Payment Successful', desc: 'Order #ORD003 payment confirmed — 12,999', time: '3 hours ago', read: false },
  { id: 'n4', type: 'warning', title: 'Low Stock Alert', desc: 'Ergonomic Mouse has only 3 units left', time: '5 hours ago', read: true },
  { id: 'n5', type: 'system', title: 'System Update', desc: 'Scheduled maintenance completed successfully', time: 'Yesterday', read: true },
];

export const MOCK_PLANS = {
  FREE: { id: 'FREE', name: 'Starter', amountInr: 0, amountUsd: 0, features: ['Up to 100 orders/month', 'Basic analytics', '1 team member', 'Community support'] },
  PREMIUM: { id: 'PREMIUM', name: 'Growth', amountInr: 249900, amountUsd: 2999, features: ['Unlimited orders', 'Advanced analytics & AI', 'Up to 10 team members', 'Priority support', 'Payment integrations', 'Custom reports'] },
  PRO: { id: 'PRO', name: 'Enterprise', amountInr: 799900, amountUsd: 9999, features: ['Everything in Growth', 'Full API access', 'White-label branding', 'Dedicated manager', '24/7 phone support', 'Custom integrations', 'SLA 99.99% uptime'] },
};

export const MOCK_SUBSCRIPTION = { plan: 'FREE', status: 'active', nextBillingDate: null };

export const MOCK_ANALYTICS_SUMMARY = {
  totalRevenue: 241850, totalOrders: 78, totalCustomers: 42, avgOrderValue: 3100,
  revenueTrend: 18.2, ordersTrend: 12.4, customersTrend: 8.6, avgOrderTrend: 5.1,
};
