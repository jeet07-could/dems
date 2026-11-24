import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'under_review', 'closed', 'archived', 'Active', 'Under Review', 'Closed'],
    default: 'Active',
  },
  stage: {
    type: String,
    default: 'Active',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'high', 'medium', 'low'],
    default: 'Medium',
  },
  state: {
    type: String,
    trim: true,
    default: 'Uttar Pradesh',
  },
  district: {
    type: String,
    trim: true,
    default: 'Ghaziabad',
  },
  thana: {
    type: String,
    trim: true,
  },
  suspect: {
    name: { type: String, default: 'Not provided' },
    email: { type: String, default: 'Not provided' },
  },
  suspectName: {
    type: String,
  },
  suspectEmail: {
    type: String,
  },
  aadhaarCard: {
    name: String,
    size: Number,
    type: { type: String },
    sha256: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  evidenceCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate caseNumber if missing
caseSchema.pre('save', async function (next) {
  if (!this.caseNumber) {
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `CASE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  if (!this.stage && this.status) {
    this.stage = this.status;
  }
  if (!this.status && this.stage) {
    this.status = this.stage;
  }
  if (!this.suspectName && this.suspect?.name) {
    this.suspectName = this.suspect.name;
  }
  if (!this.suspectEmail && this.suspect?.email) {
    this.suspectEmail = this.suspect.email;
  }
  next();
});

const Case = mongoose.model('Case', caseSchema);
export default Case;
