import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette from '../ui/CommandPalette';
import QuickActions from '../ui/QuickActions';
import './Layout.css';

const Layout = ({ onLogout }) => {
  const location = useLocation();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar onLogout={onLogout} />
        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ minHeight: '100%' }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
      <QuickActions />
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
    </div>
  );
};

export default Layout;
