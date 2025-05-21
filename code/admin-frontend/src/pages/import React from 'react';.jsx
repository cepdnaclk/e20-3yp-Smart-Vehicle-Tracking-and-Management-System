import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ 
  icon, 
  title, 
  value, 
  color = 'primary', 
  percentage, 
  isUp = true,
  delay = 0
}) => {
  // Define color classes
  const colorClasses = {
    primary: 'text-primary bg-primary',
    success: 'text-success bg-success',
    warning: 'text-warning bg-warning',
    danger: 'text-danger bg-danger',
    info: 'text-info bg-info',
    secondary: 'text-secondary bg-secondary'
  };
  
  const colorClass = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div 
      className="col-xl-3 col-md-6 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * delay }}
    >
      <motion.div 
        className="card border-0 shadow-sm h-100 stats-card"
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className={`rounded-circle p-3 ${colorClass}`} style={{ opacity: 0.2 }}>
              {icon}
            </div>
            {percentage !== undefined && (
              <motion.div 
                className={`badge ${isUp ? 'bg-success' : 'bg-danger'} d-flex align-items-center`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (0.1 * delay) }}
              >
                <TrendingUp 
                  size={14} 
                  className="me-1" 
                  style={{ transform: isUp ? 'none' : 'rotate(180deg)' }} 
                />
                {percentage}%
              </motion.div>
            )}
          </div>
          <div className="d-flex flex-column">
            <motion.h5 
              className="card-title text-gray-900 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + (0.1 * delay) }}
            >
              {value}
            </motion.h5>
            <motion.p 
              className="card-text text-muted small mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + (0.1 * delay) }}
            >
              {title}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsCard;
