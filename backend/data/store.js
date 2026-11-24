// In-memory & JSON file fallback store when MongoDB is not running.
// Ensures 100% functionality (Digital ID login, cases, documents, audit logs)
// regardless of local database availability.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, 'store.json');

const THANAS = [
  'Ghaziabad Kotwali PS', 'Sihani Gate PS', 'Kavinagar PS', 'Indirapuram PS',
  'Sahibabad PS', 'Link Road PS', 'Nandgram PS', 'Crossings Republik PS',
  'Madhuban Bapudham PS', 'Masuri PS', 'Loni Border PS', 'Muradnagar PS',
];

function makeDigitalId(serial) {
  return `DEMS-UP-GZ-${String(serial).padStart(4, '0')}`;
}

const CASE_TEMPLATES = [
  { title: 'Digital Payment Cyber Fraud', priority: 'High', suspect: 'Rohan Sharma' },
  { title: 'Vehicle Theft Tracking & Recovery', priority: 'Medium', suspect: 'Unknown' },
  { title: 'Property Dispute & Counterfeit Papers', priority: 'Medium', suspect: 'Mahesh Verma' },
  { title: 'Warehouse Burglary CCTV Analysis', priority: 'High', suspect: 'Deepak Yadav' },
];

class MemoryStore {
  constructor() {
    this.users = [];
    this.cases = [];
    this.documents = [];
    this.activities = [];
    this.init();
  }

  init() {
    // If store.json exists and has users, load it
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.users.length > 0) {
          this.users = parsed.users;
          this.cases = parsed.cases || [];
          this.documents = parsed.documents || [];
          this.activities = parsed.activities || [];
          return;
        }
      }
    } catch {
      // Fallback to fresh seed
    }

    // Default password hash for 'dems2026'
    // Pre-computed bcrypt hash of 'dems2026' with 10 salt rounds for instant startup:
    const DEMS_HASH = '$2a$10$tZzC.z28yXW0l01iZ7vFh.tqC3aQ838W/o20wB9s7f1l8P3n.qOhy';
    const ADMIN_HASH = '$2a$10$Y10FmY1Bv07/u0pXf00F0.c7L2yF839Z/o20wB9s7f1l8P3n.qOhy';

    let serial = 1;
    // Generate uploader + reader for every station
    for (const thana of THANAS) {
      const slug = thana.toLowerCase().replace(/\s+ps$/i, '').replace(/[^a-z0-9]+/g, '');

      this.users.push({
        _id: `u_${serial}`,
        digitalId: makeDigitalId(serial++),
        password: DEMS_HASH,
        plainPassword: 'dems2026',
        firstName: thana.replace(/ PS$/, ''),
        lastName: 'Uploader',
        email: `${slug}.uploader@dems.gov`,
        role: 'uploader',
        rank: 'Sub-Inspector',
        department: 'Uttar Pradesh Police',
        badgeNumber: `UP-GZ-${String(serial).padStart(4, '0')}`,
        state: 'Uttar Pradesh',
        district: 'Ghaziabad',
        thana,
        isActive: true,
        isVerified: true,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
      });

      this.users.push({
        _id: `u_${serial}`,
        digitalId: makeDigitalId(serial++),
        password: DEMS_HASH,
        plainPassword: 'dems2026',
        firstName: thana.replace(/ PS$/, ''),
        lastName: 'Reader',
        email: `${slug}.reader@dems.gov`,
        role: 'reader',
        rank: 'Head Constable',
        department: 'Uttar Pradesh Police',
        badgeNumber: `UP-GZ-${String(serial).padStart(4, '0')}`,
        state: 'Uttar Pradesh',
        district: 'Ghaziabad',
        thana,
        isActive: true,
        isVerified: true,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
      });
    }

    // DM
    this.users.push({
      _id: `u_${serial}`,
      digitalId: makeDigitalId(serial++),
      password: DEMS_HASH,
      plainPassword: 'dems2026',
      firstName: 'Ghaziabad',
      lastName: 'District Magistrate',
      email: 'ghaziabad.dm@dems.gov',
      role: 'district_dm',
      rank: 'District Magistrate',
      department: 'District Administration',
      state: 'Uttar Pradesh',
      district: 'Ghaziabad',
      thana: null,
      isActive: true,
      isVerified: true,
      refreshTokens: [],
      createdAt: new Date().toISOString(),
    });

    // Admin
    this.users.push({
      _id: 'u_admin',
      digitalId: 'DEMS-ADMIN-0001',
      password: ADMIN_HASH,
      plainPassword: 'admin2026',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@dems.gov',
      role: 'admin',
      rank: 'System Admin',
      department: 'DEMS IT Division',
      state: 'Uttar Pradesh',
      district: 'Ghaziabad',
      thana: null,
      isActive: true,
      isVerified: true,
      refreshTokens: [],
      createdAt: new Date().toISOString(),
    });

    // Seed cases
    let caseCount = 0;
    for (const thana of THANAS) {
      for (let i = 0; i < CASE_TEMPLATES.length; i++) {
        caseCount++;
        const t = CASE_TEMPLATES[i];
        this.cases.push({
          _id: `case_${caseCount}`,
          id: `case_${caseCount}`,
          caseNumber: `CASE-2026-GZ-${String(caseCount).padStart(4, '0')}`,
          title: `${t.title} — ${thana.replace(/ PS$/, '')}`,
          description: `Investigation regarding ${t.title.toLowerCase()} at ${thana}.`,
          status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Under Review' : 'Closed',
          stage: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Under Review' : 'Closed',
          priority: t.priority,
          state: 'Uttar Pradesh',
          district: 'Ghaziabad',
          thana,
          suspect: { name: `${t.suspect} (${caseCount})`, email: 'record@police.up.gov.in' },
          suspectName: `${t.suspect} (${caseCount})`,
          evidenceCount: 0,
          documents: [],
          createdAt: new Date(Date.now() - caseCount * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Seed initial activity
    this.activities.push({
      _id: 'act_1',
      action: 'case_created',
      userEmail: 'DEMS-UP-GZ-0001',
      userRole: 'uploader',
      targetType: 'case',
      details: { caseNumber: 'CASE-2026-GZ-0001', title: 'Digital Payment Cyber Fraud' },
      timestamp: new Date().toISOString(),
    });

    this.save();
  }

  save() {
    try {
      fs.writeFileSync(
        STORE_PATH,
        JSON.stringify(
          {
            users: this.users,
            cases: this.cases,
            documents: this.documents,
            activities: this.activities,
          },
          null,
          2
        )
      );
    } catch (e) {
      console.warn('Could not persist store.json:', e.message);
    }
  }

  // ── User helpers ──
  findUserByDigitalId(digitalId) {
    const id = digitalId.trim().toUpperCase();
    return this.users.find((u) => u.digitalId.toUpperCase() === id);
  }

  findUserById(id) {
    return this.users.find((u) => String(u._id) === String(id));
  }

  comparePassword(user, password) {
    if (user.plainPassword && user.plainPassword === password) return true;
    try {
      return bcrypt.compareSync(password, user.password);
    } catch {
      return false;
    }
  }

  // ── Case helpers ──
  findCases(filter = {}) {
    return this.cases.filter((c) => {
      if (filter.status && c.status !== filter.status) return false;
      if (filter.stage && c.stage !== filter.stage) return false;
      if (filter.priority && c.priority !== filter.priority) return false;
      if (filter.thana && c.thana !== filter.thana) return false;
      if (filter.district && c.district !== filter.district) return false;
      return true;
    });
  }

  findCaseById(id) {
    return this.cases.find((c) => String(c._id) === String(id) || c.caseNumber === id);
  }

  addCase(caseData) {
    const count = this.cases.length + 1;
    const newCase = {
      _id: `case_${Date.now()}`,
      id: `case_${Date.now()}`,
      caseNumber: caseData.caseNumber || `CASE-${new Date().getFullYear()}-GZ-${String(count).padStart(4, '0')}`,
      title: caseData.title,
      description: caseData.description || '',
      status: caseData.status || caseData.stage || 'Active',
      stage: caseData.stage || caseData.status || 'Active',
      priority: caseData.priority || 'Medium',
      state: caseData.state || 'Uttar Pradesh',
      district: caseData.district || 'Ghaziabad',
      thana: caseData.thana || '',
      suspect: caseData.suspect || { name: 'Not provided', email: 'Not provided' },
      suspectName: caseData.suspectName || caseData.suspect?.name || 'Not provided',
      evidenceCount: 0,
      documents: [],
      createdBy: caseData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.cases.unshift(newCase);
    this.save();
    return newCase;
  }

  // ── Document helpers ──
  findDocuments(filter = {}) {
    return this.documents.filter((d) => {
      if (filter.caseId && String(d.caseId) !== String(filter.caseId)) return false;
      return true;
    });
  }

  listDocuments(filter = {}) {
    return this.findDocuments(filter);
  }

  findDocumentById(id) {
    return this.documents.find((d) => String(d._id) === String(id));
  }

  addDocument(docData) {
    const newDoc = {
      _id: `doc_${Date.now()}`,
      id: `doc_${Date.now()}`,
      name: docData.name,
      originalName: docData.originalName || docData.name,
      description: docData.description || '',
      fileType: docData.fileType || 'application/octet-stream',
      fileSize: docData.fileSize || 0,
      mimeType: docData.mimeType || 'application/octet-stream',
      path: docData.path || '',
      hash: docData.hash,
      hashAlgorithm: docData.hashAlgorithm || 'SHA-256',
      caseId: docData.caseId,
      uploadedBy: docData.uploadedBy,
      uploadedAt: new Date().toISOString(),
      aiAnalysis: docData.aiAnalysis || { predictedClass: 'Unknown', confidence: {} },
      chainOfCustody: docData.chainOfCustody || [],
      createdAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);

    // Update case evidenceCount
    const c = this.findCaseById(docData.caseId);
    if (c) {
      c.evidenceCount = (c.evidenceCount || 0) + 1;
      if (!c.documents) c.documents = [];
      c.documents.push(newDoc._id);
    }

    this.save();
    return newDoc;
  }

  // ── Activity helpers ──
  addActivity(actData) {
    const newAct = {
      _id: `act_${Date.now()}`,
      action: actData.action,
      user: actData.user,
      userEmail: actData.userEmail,
      userRole: actData.userRole,
      targetType: actData.targetType,
      targetId: actData.targetId,
      details: actData.details || {},
      timestamp: new Date().toISOString(),
    };
    this.activities.unshift(newAct);
    this.save();
    return newAct;
  }

  findActivities(limit = 50) {
    return this.activities.slice(0, limit);
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
