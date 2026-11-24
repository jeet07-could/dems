import express from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Case from '../models/Case.js';
import Activity from '../models/Activity.js';
import { memoryStore } from '../data/store.js';

const router = express.Router();

// Get all cases
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, stage, priority, assignedTo, thana, district } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (req.user.role === 'reader' || req.user.role === 'uploader') {
      if (req.user.thana) filter.thana = req.user.thana;
    } else if (req.user.role === 'district_dm') {
      if (req.user.district) filter.district = req.user.district;
    } else {
      if (thana) filter.thana = thana;
      if (district) filter.district = district;
    }

    if (mongoose.connection.readyState === 1) {
      const cases = await Case.find(filter)
        .populate('assignedTo', 'firstName lastName digitalId email')
        .populate('createdBy', 'firstName lastName digitalId email')
        .populate('documents')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: cases,
        count: cases.length,
      });
    }

    // MemoryStore fallback
    const cases = memoryStore.findCases(filter);
    res.json({
      success: true,
      data: cases,
      count: cases.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get case statistics
router.get('/stats/overview', authenticate, async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'reader' || req.user.role === 'uploader') {
      if (req.user.thana) filter.thana = req.user.thana;
    } else if (req.user.role === 'district_dm') {
      if (req.user.district) filter.district = req.user.district;
    }

    if (mongoose.connection.readyState === 1) {
      const total = await Case.countDocuments(filter);
      const active = await Case.countDocuments({ ...filter, $or: [{ status: 'active' }, { stage: 'Active' }, { status: 'Active' }] });
      const pending = await Case.countDocuments({ ...filter, $or: [{ status: 'pending' }, { stage: 'Under Review' }, { status: 'Under Review' }] });
      const closed = await Case.countDocuments({ ...filter, $or: [{ status: 'closed' }, { stage: 'Closed' }, { status: 'Closed' }] });

      return res.json({
        success: true,
        data: { total, active, pending, closed },
      });
    }

    const all = memoryStore.findCases(filter);
    const total = all.length;
    const active = all.filter(c => c.stage === 'Active' || c.status === 'Active').length;
    const pending = all.filter(c => c.stage === 'Under Review' || c.status === 'Under Review').length;
    const closed = all.filter(c => c.stage === 'Closed' || c.status === 'Closed').length;

    res.json({
      success: true,
      data: { total, active, pending, closed },
    });
  } catch (error) {
    next(error);
  }
});

// Get case by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const caseData = await Case.findById(req.params.id)
        .populate('assignedTo', 'firstName lastName digitalId email')
        .populate('createdBy', 'firstName lastName digitalId email')
        .populate('documents');
      
      if (!caseData) {
        return res.status(404).json({ success: false, message: 'Case not found' });
      }
      return res.json({ success: true, data: caseData });
    }

    const caseData = memoryStore.findCaseById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.json({ success: true, data: caseData });
  } catch (error) {
    next(error);
  }
});

// Create case
router.post('/', authenticate, authorize('officer', 'investigator', 'admin', 'uploader'), async (req, res, next) => {
  try {
    const caseData = {
      ...req.body,
      state: req.body.state || req.user.state || 'Uttar Pradesh',
      district: req.body.district || req.user.district || 'Ghaziabad',
      thana: req.body.thana || req.user.thana,
      createdBy: req.user._id,
    };

    if (mongoose.connection.readyState === 1) {
      const newCase = new Case(caseData);
      await newCase.save();

      await Activity.create({
        action: 'case_created',
        user: req.user._id,
        userEmail: req.user.digitalId || req.user.email,
        userRole: req.user.role,
        targetType: 'case',
        targetId: newCase._id,
        details: { caseNumber: newCase.caseNumber, title: newCase.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(201).json({ success: true, data: newCase });
    }

    // MemoryStore fallback
    const newCase = memoryStore.addCase(caseData);
    memoryStore.addActivity({
      action: 'case_created',
      user: req.user._id,
      userEmail: req.user.digitalId || req.user.email,
      userRole: req.user.role,
      targetType: 'case',
      targetId: newCase._id,
      details: { caseNumber: newCase.caseNumber, title: newCase.title },
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    next(error);
  }
});

export default router;
