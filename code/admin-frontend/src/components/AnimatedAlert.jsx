import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const AnimatedAlert = ({ 
  show, 
  type = 'info', 
  message, 
  onClose, 
  duration = 5000 
}) => {
  
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'danger':
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 1050, width: 'auto', maxWidth: '90%' }}
        >
          <Alert 
            variant={type} 
            className="d-flex align-items-center shadow border-0"
            style={{ minWidth: '300px' }}
          >
            <div className="me-2">
              {getIcon()}
            </div>
            <div className="flex-grow-1">{message}</div>
            <button 
              type="button" 
              className="btn-close ms-2" 
              onClick={onClose}
              aria-label="Close"
            />
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedAlert;
