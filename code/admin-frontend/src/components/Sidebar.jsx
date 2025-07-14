import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
  Clipboard,
  ChevronRight,
  ChevronLeft,
  Home,
  BarChart3,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { authService } from '../services/authService';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const sidebarItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Overview & Analytics',
      color: '#3B82F6'
    },
    { 
      path: '/vehicles', 
      icon: Truck, 
      label: 'Vehicles',
      description: 'Fleet Management',
      color: '#10B981'
    },
    { 
      path: '/drivers', 
      icon: Users, 
      label: 'Drivers',
      description: 'Team Members',
      color: '#8B5CF6'
    },
    { 
      path: '/tasks', 
      icon: Clipboard, 
      label: 'Tasks',
      description: 'Work Orders',
      color: '#F59E0B'
    },
    { 
      path: '/alerts', 
      icon: AlertTriangle, 
      label: 'Alerts',
      description: 'Notifications',
      color: '#EF4444'
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Settings',
      description: 'Configuration',
      color: '#6B7280'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: { 
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25
      }
    }
  };

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  const handleLogoutClick = async () => {
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <motion.div 
      className="position-fixed h-100"
      style={{ 
        width: isCollapsed ? '80px' : '280px',
        left: 0, 
        top: 0, 
        zIndex: 1000,
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="d-flex flex-column h-100 position-relative">
        {/* Background Pattern */}
        <div 
          className="position-absolute w-100 h-100 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                              radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`,
            zIndex: 0
          }}
        />
        
        {/* Header */}
        <motion.div 
          className="p-4 position-relative"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  className="d-flex align-items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="me-3 p-2 rounded-2"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                    }}
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Truck size={28} className="text-white" />
                  </motion.div>
                  <div>
                    <h4 className="mb-0 fw-bold text-white">TrackMaster</h4>
                    <div 
                      className="small fw-medium"
                      style={{ color: 'rgba(148, 163, 184, 0.8)' }}
                    >
                      Fleet Management
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              className="btn border-0 p-2 rounded-2"
              style={{
                background: 'rgba(148, 163, 184, 0.1)',
                color: 'rgba(148, 163, 184, 0.8)',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ 
                scale: 1.1,
                background: 'rgba(148, 163, 184, 0.2)',
                color: 'white'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
        
        {/* Navigation */}
        <div className="flex-grow-1 px-3 position-relative" style={{ zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div 
                  className="text-uppercase small fw-bold mb-3"
                  style={{ 
                    color: 'rgba(148, 163, 184, 0.6)',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}
                >
                  Main Navigation
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.nav 
            className="nav flex-column gap-1"
            variants={containerVariants}
          >
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div 
                  key={item.path} 
                  variants={itemVariants}
                  style={{ position: 'relative' }}
                >
                  <Link 
                    to={item.path}
                    className="text-decoration-none position-relative d-block"
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.div
                      className="d-flex align-items-center p-3 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: isActive 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'transparent',
                        border: isActive 
                          ? '1px solid rgba(255, 255, 255, 0.2)' 
                          : '1px solid transparent',
                        backdropFilter: isActive ? 'blur(10px)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      whileHover={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="position-absolute start-0 top-0 h-100 rounded-end"
                          style={{
                            width: '4px',
                            background: `linear-gradient(180deg, ${item.color}, ${item.color}90)`
                          }}
                          layoutId="activeIndicator"
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30
                          }}
                        />
                      )}
                      
                      {/* Background glow on hover */}
                      <AnimatePresence>
                        {hoveredItem === index && (
                          <motion.div
                            className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                            style={{
                              background: `radial-gradient(circle at center, ${item.color}20 0%, transparent 70%)`,
                              zIndex: -1
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* Icon */}
                      <motion.div
                        className="me-3 d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          width: isCollapsed ? 'auto' : '40px',
                          height: '40px',
                          background: isActive 
                            ? `linear-gradient(135deg, ${item.color}, ${item.color}CC)`
                            : 'rgba(148, 163, 184, 0.1)',
                          color: isActive ? 'white' : 'rgba(148, 163, 184, 0.8)',
                          boxShadow: isActive 
                            ? `0 8px 16px ${item.color}40`
                            : 'none'
                        }}
                        variants={iconVariants}
                        initial="rest"
                        whileHover="hover"
                      >
                        <Icon size={20} />
                      </motion.div>
                      
                      {/* Label and description */}
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.div 
                            className="flex-grow-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div 
                              className="fw-semibold mb-0"
                              style={{ 
                                color: isActive ? 'white' : 'rgba(248, 250, 252, 0.9)',
                                fontSize: '0.875rem'
                              }}
                            >
                              {item.label}
                            </div>
                            <div 
                              className="small"
                              style={{ 
                                color: isActive 
                                  ? 'rgba(255, 255, 255, 0.7)' 
                                  : 'rgba(148, 163, 184, 0.6)',
                                fontSize: '0.75rem'
                              }}
                            >
                              {item.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Arrow indicator */}
                      <AnimatePresence>
                        {!isCollapsed && hoveredItem === index && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight 
                              size={16} 
                              style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>
        
        {/* Footer */}
        <div className="p-3 position-relative" style={{ zIndex: 1 }}>
          <motion.div
            className="mb-3"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          />
          
          <motion.button
            onClick={handleLogoutClick}
            className="btn border-0 w-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: 'white',
              padding: isCollapsed ? '12px' : '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 12px 24px rgba(239, 68, 68, 0.4)',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {/* Logout button background effect */}
            <motion.div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                transform: 'translateX(-100%)'
              }}
              whileHover={{
                transform: 'translateX(100%)',
                transition: { duration: 0.6 }
              }}
            />
            
            <LogOut size={18} className={isCollapsed ? '' : 'me-2'} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  className="fw-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* User info (when expanded) */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="mt-3 p-3 rounded-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    AD
                  </div>
                  <div>
                    <div 
                      className="fw-medium mb-0"
                      style={{ 
                        color: 'rgba(248, 250, 252, 0.9)',
                        fontSize: '0.875rem'
                      }}
                    >
                      Admin User
                    </div>
                    <div 
                      className="small"
                      style={{ 
                        color: 'rgba(148, 163, 184, 0.6)',
                        fontSize: '0.75rem'
                      }}
                    >
                      System Administrator
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;