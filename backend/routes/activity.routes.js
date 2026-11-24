import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.middleware.js';
import Activity from '../models/Activity.js';
import { memoryStore } from '../data/store.js';

const router = express.Router();

// Get activities
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const activities = await Activity.find()
        .populate('user', 'firstName lastName digitalId email')
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      return res.json({
        success: true,
        data: activities,
      });
    }

    const activities = memoryStore.findActivities(parseInt(limit));
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
