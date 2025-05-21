import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  Truck, 
  Users, 
  AlertTriangle, 
  Settings, 
  LogOut,
  PieChart,
  Bell,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  
  const sidebarItems = [
    { path: '/dashboard', icon: <Map size={20} />, label: 'Dashboard' },
    { path: '/vehicles', icon: <Truck size={20} />, label: 'Vehicles' },
    { path: '/drivers', icon: <Users size={20} />, label: 'Drivers' },
    { path: '/alerts', icon: <AlertTriangle size={20} />, label: 'Alerts' },
    { path: '/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/help', icon: <HelpCircle size={20} />, label: 'Help & Support' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="position-fixed h-100 bg-white border-end sidebar"
      style={{ width: '250px', left: 0, top: 0, zIndex: 1000 }}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="d-flex flex-column h-100">
        <div className="py-4 px-3 border-bottom">
          <motion.div 
            className="d-flex align-items-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="me-2">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 0 }}
              >
                <TrendingUp size={32} className="text-primary" />
              </motion.div>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">TrackMaster</h4>
              <div className="text-muted small">Fleet Management</div>
            </div>
          </motion.div>
        </div>
        
        <div className="p-3 flex-grow-1">
          <div className="text-uppercase small text-muted fw-bold mb-3 ms-2">Main Menu</div>
          
          <motion.nav 
            className="nav flex-column"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sidebarItems.map((item) => (
              <motion.div key={item.path} variants={itemVariants}>
                <Link 
                  to={item.path} 
                  className={`sidebar-link mb-2 ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>
        
        <div className="border-top p-3">
          <motion.button
            onClick={handleLogout}
            className="btn btn-outline-danger d-flex align-items-center w-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <LogOut size={18} className="me-2" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;