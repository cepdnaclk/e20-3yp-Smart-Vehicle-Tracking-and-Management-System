const express = require('express');
const router = express.Router();
const AlertHistory = require('../models/AlertHistory');
const auth = require('../middleware/auth');

// POST /api/alerts - Store new alert
router.post('/', auth, async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      companyId: req.user.companyId // Get companyId from authenticated user
    };

    const alert = new AlertHistory(alertData);
    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Alert stored successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error storing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store alert'
    });
  }
});

// GET /api/alerts - Get alert history
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, startDate, endDate, vehicleId } = req.query;
    const query = { companyId: req.user.companyId };

    // Add filters if provided
    if (type) query.type = type;
    if (status) query.status = status;
    if (vehicleId) query['vehicle.id'] = vehicleId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const alerts = await AlertHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(100); // Limit to last 100 alerts for performance

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// PUT /api/alerts/:id/status - Update alert status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await AlertHistory.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = status;
    if (status === 'resolved') {
      alert.resolvedAt = new Date();
      alert.resolvedBy = req.user.userId;
    } else if (status === 'acknowledged') {
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = req.user.userId;
    }

    await alert.save();

    res.json({
      success: true,
      message: 'Alert status updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert status'
    });
  }
});

module.exports = router; 