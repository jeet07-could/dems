# DEMS — Digital Evidence Mission
## Institutional Deployment & Security Operations Manual

This guide covers production deployment, infrastructure provisioning, environment variable configuration, AI Intelligence integration (Google Gemini), blockchain network verification, and legal compliance (Bharatiya Sakshya Adhiniyam 2023 / Section 65B).

---

## 1. System Architecture Overview

```
                                  +-----------------------------+
                                  |   National Officer Portal   |
                                  | (Vite + React + TailwindCSS)|
                                  +--------------+--------------+
                                                 | HTTPS / WSS
                                                 v
                                  +-----------------------------+
                                  |    Nginx Reverse Proxy      |
                                  |  (SSL / TLS 1.3 Termination)|
                                  +--------------+--------------+
                                                 |
                         +-----------------------+-----------------------+
                         |                                               |
                         v                                               v
          +-----------------------------+                 +-----------------------------+
          |      DEMS Core Backend      |                 |    DEMS Static Frontend     |
          |  (Node.js / Express API)    |                 |   (/var/www/dems/dist)      |
          +--------------+--------------+                 +-----------------------------+
                         |
       +-----------------+-----------------+-----------------+
       |                                   |                 |
       v                                   v                 v
+--------------+                   +---------------+  +--------------+
|   MongoDB    |                   |  Consortium   |  | Google Cloud |
| Database     |                   |  Blockchain   |  | Gemini AI API|
| Cluster      |                   |  Ledger (PoA) |  | (v1beta REST)|
+--------------+                   +---------------+  +--------------+
```

### Core Security & Forensics Guarantees
- **Client-Side SHA-256:** Browser hashes original files using `SubtleCrypto` before transmission.
- **Server-Side SHA-256:** Backend verifies payload integrity upon receipt.
- **AES-256-GCM Storage Encryption:** Evidence artifacts encrypted at rest with tamper-evident authentication tags.
- **PoA Blockchain Ledger:** Blocks sealed with SHA-256 Merkle roots, validator signatures, and previous block hashes.
- **Role-Based Access Control (RBAC):** Strict jurisdictional enforcement across 4 tiers (`uploader`, `reader`, `district_dm`, `admin`).
- **Grounded AI Intelligence Center:** Strict pre-retrieval role gating, isolated prompts, prompt-injection filters, and zero training-on-evidence policies.

---

## 2. Environment Variables & Credentials Setup

Copy `backend/.env.example` to `backend/.env` on the target production server:

```bash
cd /opt/dems/backend
cp .env.example .env
chmod 600 .env
```

### Configuration Parameters

| Parameter | Recommended Production Value | Description |
|-----------|------------------------------|-------------|
| `PORT` | `3001` (or internal port) | Backend HTTP listen port |
| `NODE_ENV` | `production` | Enables production error redaction & caching |
| `MONGO_URI` | `mongodb://user:pass@mongo-host:27017/dems?authSource=admin` | Replica Set MongoDB URI (falls back to local JSON if offline) |
| `JWT_SECRET` | 64+ char random string | HS256 secret for signing auth tokens (`openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | 64+ char random string | HS256 secret for refresh token rotation (`openssl rand -hex 32`) |
| `ENCRYPTION_KEY` | 32-byte hexadecimal key | AES-256-GCM master evidence encryption key (`openssl rand -hex 32`) |
| `ALLOWED_ORIGIN` | `https://dems.gov.in` | CORS whitelisted production origin |
| `GEMINI_API_KEY` | `AIzaSy...` | Official Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model (`gemini-1.5-flash` or `gemini-1.5-pro`) |
| `LOG_LEVEL` | `info` | Audit logging level (`info` / `warn` / `error`) |

> **IMPORTANT:** Never commit `.env` or paste actual API keys in version control. All AI endpoints operate in a secure deterministic fallback mode if `GEMINI_API_KEY` is not set.

---

## 3. Production Deployment Guide (Ubuntu 22.04 / 24.04 LTS)

### Step 3.1: Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Step 3.2: Clone & Build Application
```bash
# Clone repository
sudo mkdir -p /opt/dems
sudo chown -R $USER:$USER /opt/dems
cd /opt/dems
git clone <repository_url> .

# Build Frontend
cd /opt/dems/frontend
npm ci
npm run build

# Install Backend
cd /opt/dems/backend
npm ci --omit=dev
```

### Step 3.3: Configure PM2 Process Manager
Create `/opt/dems/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'dems-backend',
      script: './backend/server.js',
      cwd: '/opt/dems',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '1G',
      error_file: '/var/log/dems/backend-err.log',
      out_file: '/var/log/dems/backend-out.log',
      merge_logs: true,
      time: true
    }
  ]
}
```

Start the application:
```bash
sudo mkdir -p /var/log/dems
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3.4: Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/dems.conf`:
```nginx
server {
    listen 80;
    server_name dems.gov.in www.dems.gov.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dems.gov.in www.dems.gov.in;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/dems.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dems.gov.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';" always;

    # Frontend Single Page App
    root /opt/dems/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Express Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }
}
```

Enable site and obtain SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/dems.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d dems.gov.in -d www.dems.gov.in
```

---

## 4. AI Intelligence Verification & SOP Runbook

The DEMS platform includes 8 specialized forensic AI workspaces:
1. **Case Copilot:** Natural language evidence reasoning.
2. **Timeline Reconstruction:** Chronological incident sequencing.
3. **Discrepancy Review:** Cross-document contradictory statement detection.
4. **Relationship Graph:** Co-occurrence entity clustering.
5. **Case Briefing Generator:** Executive summary generation for court presentations.
6. **Semantic Evidence Search:** Conceptual search across witness statements and reports.
7. **AI Redaction Assistant:** Privacy-preserving PII redaction without modifying original hashes.
8. **Knowledge Base & Benchmark:** SOP guidelines and forensic evaluation benchmark.

### Running AI Diagnostic & Evaluation Suite
To execute the automated 6-point benchmark suite:
```bash
curl -X POST https://dems.gov.in/api/ai/evaluation/run \
  -H "Authorization: Bearer <ADMIN_OR_DM_JWT>" \
  -H "Content-Type: application/json"
```

Expected benchmark response:
- **Scenarios Evaluated:** 6/6 passing.
- **Grounding Compliance:** > 95%.
- **Hallucination Prevention:** 100% (No fabricated legal judgments).
- **Latency:** < 1800ms per standard forensic case.

---

## 5. Bharatiya Sakshya Adhiniyam 2023 (Section 65B) Legal Checklist

Before submitting DEMS evidence records in a court of law:
1. **Hash Verification:** Run `Inspect` in the Evidence screen to compare stored vs current SHA-256 hashes.
2. **Blockchain Ledger Receipt:** Verify the block transaction hash on the Blockchain Explorer.
3. **Chain of Custody Certificate:** Confirm all officer custody transfers have been cryptographically signed.
4. **Certificate of Electronic Evidence:** Print Section 65B Certificate generated via the DEMS Case Workspace.
