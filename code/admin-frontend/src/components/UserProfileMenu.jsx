import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

const UserProfileMenu = ({ handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // User data - in a real app this would come from a context or state
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'System Owner',
    initials: 'AU'
  };
  
  return (
    <div className="position-relative" ref={menuRef}>
      <motion.div
        className="d-flex align-items-center user-profile-trigger"
        style={{ cursor: 'pointer' }}
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-2" 
          style={{ width: '40px', height: '40px' }}>
          <span className="fw-bold">{user.initials}</span>
        </div>
        <div className="d-none d-md-block">
          <div className="fw-medium">{user.name}</div>
          <div className="text-muted small">{user.role}</div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
            style={{ 
              width: '280px', 
              zIndex: 1000,
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-bottom">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3" 
                  style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  <span className="fw-bold">{user.initials}</span>
                </div>
                <div>
                  <div className="fw-bold">{user.name}</div>
                  <div className="text-muted small">{user.email}</div>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <Link to="/profile" className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={() => setIsOpen(false)}>
                <User size={18} className="me-2 text-secondary" />
                <span>My Profile</span>
                <ChevronRight size={16} className="ms-auto text-muted" />
              </Link>
              
              <Link to="/settings" className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={() => setIsOpen(false)}>
                <Settings size={18} className="me-2 text-secondary" />
                <span>Settings</span>
                <ChevronRight size={16} className="ms-auto text-muted" />
              </Link>
              
              <Link to="/notifications" className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={() => setIsOpen(false)}>
                <Bell size={18} className="me-2 text-secondary" />
                <span>Notifications</span>
                <span className="ms-auto badge bg-danger">2</span>
              </Link>
              
              <Link to="/help" className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={() => setIsOpen(false)}>
                <HelpCircle size={18} className="me-2 text-secondary" />
                <span>Help & Support</span>
                <ChevronRight size={16} className="ms-auto text-muted" />
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <button 
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }} 
                className="dropdown-item py-2 px-3 d-flex align-items-center text-danger"
              >
                <LogOut size={18} className="me-2" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileMenu;
