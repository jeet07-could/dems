// Seed script — populates MongoDB with demo users (with Digital Identities) and cases.
// Run:  node backend/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Case from './models/Case.js';
import Activity from './models/Activity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dems';

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

async function seed() {
  console.log('🌱 Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.\n');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    Activity.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing users, cases, and activities.\n');

  const createdUsers = [];
  let serial = 1;

  // 1. Create uploader + reader for every police station
  for (const thana of THANAS) {
    const slug = thana.toLowerCase().replace(/\s+ps$/i, '').replace(/[^a-z0-9]+/g, '');

    const uploader = new User({
      digitalId: makeDigitalId(serial++),
      password: 'dems2026',
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
    });
    await uploader.save();
    createdUsers.push(uploader);

    const reader = new User({
      digitalId: makeDigitalId(serial++),
      password: 'dems2026',
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
    });
    await reader.save();
    createdUsers.push(reader);
  }

  // 2. District Magistrate
  const dm = new User({
    digitalId: makeDigitalId(serial++),
    password: 'dems2026',
    firstName: 'Ghaziabad',
    lastName: 'District Magistrate',
    email: 'ghaziabad.dm@dems.gov',
    role: 'district_dm',
    rank: 'District Magistrate',
    department: 'District Administration',
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    thana: null,
  });
  await dm.save();
  createdUsers.push(dm);

  // 3. Admin
  const admin = new User({
    digitalId: 'DEMS-ADMIN-0001',
    password: 'admin2026',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@dems.gov',
    role: 'admin',
    rank: 'System Admin',
    department: 'DEMS IT Division',
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    thana: null,
  });
  await admin.save();
  createdUsers.push(admin);

  console.log(`✅ Seeded ${createdUsers.length} users with Digital Identities.\n`);

  // 4. Seed initial cases for each station
  let caseCount = 0;
  for (const thana of THANAS) {
    const uploader = createdUsers.find((u) => u.thana === thana && u.role === 'uploader');
    for (let i = 0; i < CASE_TEMPLATES.length; i++) {
      const template = CASE_TEMPLATES[i];
      caseCount++;
      const newCase = new Case({
        caseNumber: `CASE-2026-GZ-${String(caseCount).padStart(4, '0')}`,
        title: `${template.title} — ${thana.replace(/ PS$/, '')}`,
        description: `Investigation regarding ${template.title.toLowerCase()} reported at ${thana}.`,
        status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Under Review' : 'Closed',
        stage: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Under Review' : 'Closed',
        priority: template.priority,
        state: 'Uttar Pradesh',
        district: 'Ghaziabad',
        thana,
        suspect: {
          name: `${template.suspect} (${caseCount})`,
          email: 'record@police.up.gov.in',
        },
        createdBy: uploader?._id || admin._id,
      });
      await newCase.save();

      // Log activity
      await Activity.create({
        action: 'case_created',
        user: uploader?._id || admin._id,
        userEmail: uploader?.digitalId || admin.digitalId,
        userRole: uploader?.role || 'admin',
        targetType: 'case',
        targetId: newCase._id,
        details: { caseNumber: newCase.caseNumber, title: newCase.title },
      });
    }
  }

  console.log(`✅ Seeded ${caseCount} cases and logged initial activities.\n`);

  console.log('Sample Logins:');
  console.log('• Ghaziabad Kotwali Uploader: DEMS-UP-GZ-0001 / dems2026');
  console.log('• Ghaziabad Kotwali Reader:   DEMS-UP-GZ-0002 / dems2026');
  console.log('• Sihani Gate Uploader:      DEMS-UP-GZ-0003 / dems2026');
  console.log('• District Magistrate:       DEMS-UP-GZ-0025 / dems2026');
  console.log('• System Administrator:      DEMS-ADMIN-0001 / admin2026\n');

  await mongoose.disconnect();
  console.log('✅ Done. Database setup completed successfully.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
