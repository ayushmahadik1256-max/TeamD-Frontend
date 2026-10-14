# APNILEAP — Smart File Backup System
## Team D: Backup Control & Restore Dashboard (Web UI & BFF)

**RIT CSE Mini Project Implementation | Academic Year 2026–27**

This application provides the official user experience, orchestration interface, and telemetry console for **Team D** in the APNILEAP Smart File Backup & Restore platform, fully integrated with **Team C** (DBMS Engine), **Team A** (OS Engine / Job Scheduler), and **Team B** (DSA Engine / Deduplication & Merkle Tree).

---

### 🌟 Key Capabilities Implemented

1. **Auto-Registration to Team C Database (Blueprint Section C1 / D1)**
   - When the user opens the website or enters their institutional email, the frontend queries Team C database via `GET /api/v1/users`.
   - If the user is not found, Team D automatically executes `POST /api/v1/users` to register the new user into Team C's relational database.
   - The user immediately transitions to their **Own Dashboard** displaying only their own files and activities.

2. **Actual File Upload & Database Storage (Blueprint Section C1 / D2)**
   - Users can upload real files (PDF, Parquet, CSV, documents, etc.) via file picker or drag-and-drop.
   - Team D computes the cryptographic SHA-256 checksum and base64 payload, then dispatches `POST /api/v1/files` to Team C.
   - In addition, the file binary (Blob/ArrayBuffer), checksum, and metadata are persisted in the client-side IndexedDB database (`apnileap_file_db`), ensuring that the file is permanently stored and retrievable.

3. **Cross-Team Saga Orchestration (Blueprint Section 4 & 5)**
   - Dispatches actual HTTP requests across deployed Render services:
     1. **Team D**: Request validation, `X-Correlation-ID` & `Idempotency-Key` envelope generation.
     2. **Team C**: Master Data Check & Backup State (`POST /api/v1/backups`).
     3. **Team A**: Job Scheduling & Exclusive Lock lease (`POST /api/v1/backup/jobs` & `/internal/v1/locks/acquire`).
     4. **Team B**: Chunking, Rabin-Karp hashing, and dedup ratio computation (`POST /api/v1/dedup/compute`).
     5. **Team B / Team D**: Merkle tree proof verification (`POST /api/v1/integrity/verify`).
     6. **Team C / Team D**: ACID commit and file deliverable availability (`COMMITTED`).

4. **File Retrieval During and After Backup & Restore**
   - **Backup Hub**: When a backup finishes (or from the historical backups table), a **Download File** button allows the user to immediately get their backed-up file.
   - **File Explorer**: Every file row and version drawer includes a direct **Download** action.
   - **Restore Center**: Executing an atomic restore provides a **Download Restored File** button for point-in-time recovery artifacts.

5. **Cross-Team Endpoint Manager (Render & Ngrok)**
   - Live endpoint configuration for **Team C**, **Team A**, and **Team B** with one-click **Ping** and latency tests.
   - Automatic injection of tracing and idempotency headers:
     - `X-Correlation-ID: <uuid>`
     - `Idempotency-Key: <uuid>`
     - `ngrok-skip-browser-warning: 69420`
     - `Authorization: Bearer <token>`
   - Tolerant 45s timeout support for Render free-tier cold starts.

---

### 🚀 Getting Started

#### 1. Install & Start Development Server
```bash
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

#### 2. Configure Your Render Endpoints
1. On the initial sign-in screen or via the **Gear icon (Settings)** in the top right:
   - **Team C Render URL**: e.g., `https://team-c-dbms.onrender.com`
   - **Team A Render URL**: e.g., `https://team-a-scheduler.onrender.com`
   - **Team B Render URL**: e.g., `https://team-b-dedup.onrender.com`
2. Click **Ping Team C** or **Test All Endpoints** to verify live connectivity.
3. Click **Save URLs**.

#### 3. Sign In & Auto-Register
1. Enter your institutional email (e.g. `ayush@gmail.com`).
2. Click **Enter Dashboard (Connect & Register)**.
3. Team D will register you into Team C's database if not present, and load your personal dashboard.

#### 4. Upload & Backup Files
1. Go to **File Explorer** and click **Upload New File**.
2. Select your file and click **Upload & Store File**.
3. Navigate to **Backup Hub**, select the file, choose strategy (Full, Incremental, Differential), and click **Start Backup Workflow**.
4. Once completed, click **Download File** to get your file back.