import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Digital Identity Schema ──
// Every user gets a unique Digital ID (e.g., DEMS-UP-GZ-0001) that serves as
// their primary login credential. The ID encodes state, district, and a serial.

const userSchema = new mongoose.Schema({
  // ─── Digital Identity ───
  digitalId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    // Format: DEMS-<STATE_CODE>-<DISTRICT_CODE>-<SERIAL>
    // e.g.   DEMS-UP-GZ-0001
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // ─── Personal Info ───
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
  },

  // ─── Role & Posting ───
  role: {
    type: String,
    enum: ['viewer', 'officer', 'investigator', 'admin', 'uploader', 'reader', 'district_dm'],
    default: 'viewer',
  },
  rank: {
    type: String,
    trim: true,
    // e.g. "Sub-Inspector", "Inspector", "Superintendent", "DM"
  },
  badgeNumber: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },

  // ─── Jurisdiction ───
  state: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  thana: {
    type: String,
    trim: true,
    // Police station name, null for district-level officers
  },

  // ─── Account Status ───
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
    default: null,
  },

  // ─── Tokens ───
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Virtual: full name ──
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Virtual: role display name ──
const ROLE_NAMES = {
  viewer: 'Viewer',
  officer: 'Officer',
  investigator: 'Investigator',
  admin: 'Admin',
  uploader: 'Uploader',
  reader: 'Reader',
  district_dm: 'District Magistrate',
};
userSchema.virtual('roleName').get(function () {
  return ROLE_NAMES[this.role] || this.role;
});

// ── Hash password before saving ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Compare password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Account lock check ──
userSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  return this.lockedUntil > new Date();
};

// ── Increment failed login attempts ──
userSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  }
  await this.save();
};

// ── Reset login attempts ──
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  await this.save();
};

// ── Indexes ──
userSchema.index({ state: 1, district: 1, thana: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
