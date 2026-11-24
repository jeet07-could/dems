import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import authService from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { memoryStore } from '../data/store.js';

const router = express.Router();

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({ success: false, errors: errors.array() });
  };
};

// ── Register with Digital Identity ──
router.post('/register', validate([
  body('digitalId').notEmpty().withMessage('Digital ID is required'),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').optional().isIn(['viewer', 'officer', 'investigator', 'admin', 'uploader', 'reader', 'district_dm']),
]), async (req, res, next) => {
  try {
    const {
      digitalId, password, firstName, lastName, email,
      role, rank, department, badgeNumber,
      state, district, thana,
    } = req.body;

    const normalizedId = digitalId.trim().toUpperCase();

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ digitalId: normalizedId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Digital ID ${normalizedId} is already registered.`,
        });
      }

      const user = new User({
        digitalId: normalizedId,
        password,
        firstName,
        lastName,
        email,
        role: role || 'viewer',
        rank,
        department,
        badgeNumber,
        state,
        district,
        thana,
        isVerified: true,
      });

      await user.save();
      const tokens = await authService.generateTokens(user);

      await Activity.create({
        action: 'user_created',
        user: user._id,
        userEmail: user.email || user.digitalId,
        userRole: user.role,
        targetType: 'user',
        targetId: user._id,
        details: { digitalId: normalizedId, registration: true },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      const userData = user.toObject();
      delete userData.password;
      delete userData.refreshTokens;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: { user: userData, tokens },
      });
    }

    // Fallback store
    const existing = memoryStore.findUserByDigitalId(normalizedId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Digital ID ${normalizedId} is already registered.`,
      });
    }

    const newUser = {
      _id: `u_${Date.now()}`,
      digitalId: normalizedId,
      password: password,
      plainPassword: password,
      firstName,
      lastName,
      email,
      role: role || 'viewer',
      rank,
      department,
      badgeNumber,
      state,
      district,
      thana,
      isActive: true,
      isVerified: true,
      refreshTokens: [],
      createdAt: new Date().toISOString(),
    };
    memoryStore.users.push(newUser);
    memoryStore.save();

    const tokens = {
      accessToken: authService.generateAccessToken(newUser),
      refreshToken: authService.generateRefreshToken(newUser),
    };

    memoryStore.addActivity({
      action: 'user_created',
      user: newUser._id,
      userEmail: newUser.digitalId,
      userRole: newUser.role,
      targetType: 'user',
      details: { digitalId: normalizedId },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { user: newUser, tokens },
    });
  } catch (error) {
    next(error);
  }
});

// ── Login via Digital ID + Password ──
router.post('/login', validate([
  body('digitalId').notEmpty().withMessage('Digital ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), async (req, res, next) => {
  try {
    const { digitalId, password } = req.body;
    const normalizedId = digitalId.trim().toUpperCase();

    // Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ digitalId: normalizedId });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Digital ID or password.',
        });
      }

      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is locked due to too many failed attempts.',
        });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        await user.incrementLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid Digital ID or password.',
        });
      }

      await user.resetLoginAttempts();
      const tokens = await authService.generateTokens(user);

      user.lastLogin = new Date();
      await user.save();

      await Activity.create({
        action: 'login',
        user: user._id,
        userEmail: user.digitalId || user.email,
        userRole: user.role,
        details: { digitalId: normalizedId, method: 'digital_identity' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      const userData = user.toObject();
      delete userData.password;
      delete userData.refreshTokens;

      return res.json({
        success: true,
        message: 'Login successful',
        data: { user: userData, tokens },
      });
    }

    // MemoryStore fallback (when MongoDB is offline)
    const user = memoryStore.findUserByDigitalId(normalizedId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Digital ID or password.',
      });
    }

    const isValid = memoryStore.comparePassword(user, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Digital ID or password.',
      });
    }

    const tokens = {
      accessToken: authService.generateAccessToken(user),
      refreshToken: authService.generateRefreshToken(user),
    };

    memoryStore.addActivity({
      action: 'login',
      user: user._id,
      userEmail: user.digitalId,
      userRole: user.role,
      details: { digitalId: normalizedId },
    });

    const userData = { ...user };
    delete userData.password;
    delete userData.plainPassword;
    delete userData.refreshTokens;

    res.json({
      success: true,
      message: 'Login successful (Digital Identity Verified)',
      data: { user: userData, tokens },
    });
  } catch (error) {
    next(error);
  }
});

// ── Profile ──
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ── Refresh Token ──
router.post('/refresh-token', async (req, res, next) => {
  try {
    const tokens = await authService.refreshAccessToken(req.body.refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

// ── Logout ──
router.post('/logout', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
