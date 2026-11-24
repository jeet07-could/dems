# DEMS — Digital Evidence Mission
### National Digital Evidence Management & Chain-of-Custody Platform

**DEMS (Digital Evidence Mission)** is an institutional-grade digital evidence management, forensic verification, and chain-of-custody platform designed for Police Stations, District Authorities, Judiciary, and Administrative Oversight.

Built with a high-trust institutional UI/UX design direction inspired by National Digital Public Infrastructure standards.

---

## 🏛️ Core Architectural Capabilities

- **🔐 Digital Identity Access Control (RBAC):** Station/Officer-specific jurisdictional access across 4 operational tiers:
  - `uploader`: Investigating Officers & Sub-Inspectors (Evidence registration & case submission).
  - `reader`: Head Constables & Verification Officers (Evidence inspection & audit verification).
  - `district_dm`: District Magistrates & Supervisory Authorities (Jurisdiction-wide analytics & audit).
  - `admin`: State Data Center & System Administrators (Full governance & node operations).
- **⛓️ Proof-of-Authority (PoA) Consortium Blockchain Ledger:**
  - Tamper-proof block generation with cryptographic Merkle trees.
  - Evidence anchoring with SHA-256 integrity validation and validator signatures.
  - Real-time Blockchain Explorer showing block height, hash, previous hash, and transaction receipts.
- **🛡️ Cryptographic Integrity & Tamper-Evident Storage:**
  - Client-side in-browser SHA-256 pre-hashing via Web Cryptography API (`SubtleCrypto`).
  - Server-side independent SHA-256 validation before persistence.
  - AES-256-GCM symmetric encryption for evidence artifacts at rest.
  - Offline fallback persistence (`memoryStore`) guaranteeing zero downtime when external databases are unavailable.
- **🧠 Google Gemini Multi-Modal AI Intelligence Suite:**
  - **Case Copilot:** Grounded natural language evidence reasoning.
  - **Timeline Reconstruction:** Automatic chronological incident sequencing.
  - **Discrepancy Review:** Cross-document statement conflict detection.
  - **Relationship Graph:** Interactive entity link clustering.
  - **Case Briefing Generator:** Automated executive briefings for courtroom presentation.
  - **Semantic Evidence Search:** Concept-based search across police reports and witness statements.
  - **AI Redaction Assistant:** Suggests PII redactions for public disclosure while preserving evidence hash immutability.
  - **Knowledge Base & Benchmark:** Searchable SOP engine and automated 6-point evaluation benchmark.
- **⚖️ Legal Admissibility (Bharatiya Sakshya Adhiniyam 2023 / Section 65B):**
  - Section 65B electronic evidence certification checklist.
  - Complete chronological custody audit logs signed and stamped.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+
- *(Optional)* MongoDB 6+ (System automatically runs on high-performance fallback engine if MongoDB is offline)

### 1. Installation
```bash
git clone https://github.com/kkrrishagarwal/dems.git
cd dems
npm install
```

### 2. Environment Configuration
Copy environment configuration template:
```bash
cp backend/.env.example backend/.env
```

*(Optional)* Configure your Google Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
*Note: If no Gemini API key is configured, DEMS automatically runs in deterministic forensic intelligence mode with zero downtime.*

### 3. Start Development Server
```bash
npm run dev
```
- **Frontend Portal:** http://localhost:5173
- **Backend Core API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Pre-Configured Demo Credentials

| Role | Digital ID | Station / Department | Password |
|---|---|---|---|
| **Uploader (SI)** | `DEMS-UP-GZ-0001` | Ghaziabad Kotwali PS | `dems2026` |
| **Reader (HC)** | `DEMS-UP-GZ-0002` | Ghaziabad Kotwali PS | `dems2026` |
| **District DM** | `DEMS-UP-GZ-0025` | District Magistrate Office | `dems2026` |
| **System Admin** | `DEMS-ADMIN-0001` | State Data Center | `admin2026` |

---

## 📂 Project Structure

```
dems/
├── backend/
│   ├── controllers/      # AI, Auth, Case, Document, Blockchain controllers
│   ├── middleware/       # JWT auth & RBAC authorization
│   ├── models/           # Mongoose schemas (Case, Document, Activity, User)
│   ├── routes/           # Express REST endpoints
│   ├── services/         # Gemini AI, Blockchain, Crypto, Knowledge Base
│   ├── data/             # Persistent fallback data store & seed records
│   ├── server.js         # HTTP server & API mounting
│   └── .env.example      # Deployment environment template
├── frontend/
│   ├── public/assets/    # Authentic State Emblem of India (SVG & PNG)
│   ├── src/
│   │   ├── components/   # NationalEmblem, Logo, Badge, MetricCard, Sidebar
│   │   ├── context/      # AuthContext (Digital ID authentication & RBAC)
│   │   ├── lib/          # API client & client-side SHA-256 hashing
│   │   ├── pages/        # Dashboard, Cases, Evidence, Blockchain, Activity, Intelligence, Login
│   │   ├── App.jsx       # Routing & authentication guard
│   │   └── index.css     # Government design system styling
│   └── vite.config.js    # Vite configuration
├── scripts/
│   └── dev.js            # Monorepo concurrent process runner
├── DEPLOYMENT.md         # Production deployment & Nginx/PM2 manual
└── package.json          # Root scripts & workspaces
```

---

## 📜 License & Compliance

Designed and developed for digital policing, judicial transparency, and forensic evidentiary compliance under the laws of India.
