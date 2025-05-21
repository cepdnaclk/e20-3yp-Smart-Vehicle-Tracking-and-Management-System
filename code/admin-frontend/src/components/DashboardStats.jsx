import React from 'react';
import { Row } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Truck, Zap, Users, Activity } from 'lucide-react';
import StatsCard from './StatsCard';

const DashboardStats = ({ 
  totalVehicles = 0, 
  activeVehicles = 0, 
  totalDrivers = 0, 
  activeAlerts = 0 
}) => {
  return (
    <motion.div 
      className="row mb-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        }
      }}
    >
      <StatsCard 
        icon={<Truck size={24} className="text-primary" />} 
        title="Total Vehicles" 
        value={totalVehicles} 
        color="primary"
        percentage="12"
        isUp={true}
        delay={0}
      />
      <StatsCard 
        icon={<Zap size={24} className="text-success" />} 
        title="Active Vehicles" 
        value={activeVehicles} 
        color="success"
        percentage="5"
        isUp={true}
        delay={1}
      />
      <StatsCard 
        icon={<Users size={24} className="text-info" />} 
        title="Total Drivers" 
        value={totalDrivers} 
        color="info"
        percentage="8"
        isUp={true}
        delay={2}
      />
      <StatsCard 
        icon={<Activity size={24} className="text-danger" />} 
        title="Active Alerts" 
        value={activeAlerts} 
        color="danger"
        percentage={activeAlerts > 0 ? "3" : "0"}
        isUp={activeAlerts > 0 ? false : true}
        delay={3}
      />
    </motion.div>
  );
};

export default DashboardStats;
