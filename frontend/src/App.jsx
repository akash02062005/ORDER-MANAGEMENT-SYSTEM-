import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/ui/Loader';
import './App.css';
import './i18n';

const Layout       = lazy(() => import('./components/layout/Layout'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Login        = lazy(() => import('./pages/Login'));
const Orders       = lazy(() => import('./pages/Orders'));
const Products     = lazy(() => import('./pages/Products'));
const Customers    = lazy(() => import('./pages/Customers'));
const Register     = lazy(() => import('./pages/Register'));
const Settings     = lazy(() => import('./pages/Settings'));
const HelpCenter   = lazy(() => import('./pages/HelpCenter'));
const Pricing      = lazy(() => import('./pages/Pricing'));
const Billing      = lazy(() => import('./pages/Billing'));
const Analytics    = lazy(() => import('./pages/Analytics'));
const Invoices     = lazy(() => import('./pages/Invoices'));
const Inventory    = lazy(() => import('./pages/Inventory'));
const Team         = lazy(() => import('./pages/Team'));
const Integrations = lazy(() => import('./pages/Integrations'));
const AIInsights   = lazy(() => import('./pages/AIInsights'));
const Shipments    = lazy(() => import('./pages/Shipments'));
const Discounts    = lazy(() => import('./pages/Discounts'));
const Reports      = lazy(() => import('./pages/Reports'));
const ActivityLog  = lazy(() => import('./pages/ActivityLog'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Landing      = lazy(() => import('./pages/Landing'));
const Onboarding   = lazy(() => import('./pages/Onboarding'));
const SaaSAdmin    = lazy(() => import('./pages/SaaSAdmin'));

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, hasRole, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (!hasRole('ROLE_ADMIN')) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user, logout } = useAuth();

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />

        {/* Onboarding — requires auth but not the full layout */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout onLogout={logout} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="team" element={<Team />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="ai" element={<AIInsights />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="billing" element={<Billing />} />
          <Route path="saas-admin" element={<SaaSAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer theme="dark" position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
