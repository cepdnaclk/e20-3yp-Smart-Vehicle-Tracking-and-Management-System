const mongoose = require('mongoose');

const alertHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'speed', 'accident', 'tampering']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  message: {
    type: String,
    required: true
  },
  vehicle: {
    id: String,
    name: String,
    licensePlate: String
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active'
  },
  details: String,
  triggerCondition: {
    threshold: Number,
    currentValue: Number,
    unit: String,
    impactForce: String,
    airbagDeployed: Boolean,
    gpsSignal: String,
    doorOpened: Boolean,
    ignitionOff: Boolean,
    securitySystem: String
  },
  companyId: {
    type: String,
    required: true
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  acknowledgedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

// Index for efficient querying
alertHistorySchema.index({ companyId: 1, timestamp: -1 });
alertHistorySchema.index({ type: 1, status: 1 });
alertHistorySchema.index({ vehicle: 1 });

const AlertHistory = mongoose.model('AlertHistory', alertHistorySchema);

module.exports = AlertHistory; 