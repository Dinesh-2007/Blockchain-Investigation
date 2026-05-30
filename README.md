# ⛓️ Digital Evidence Integrity System

A full-stack investigative application designed for law enforcement, courts, and forensic analysts to upload, manage, and cryptographically verify the integrity of digital evidence. This system uses mock blockchain simulation to create an immutable "Chain of Custody" ledger, generating faux cryptographic transaction IDs and block numbers to guarantee data provenance.

## 🚀 Key Features

*   **Evidence Hashing**: Generates SHA-256 and MD5 hashes for uploaded evidentiary files.
*   **Blockchain Ledger Simulation**: Mock cryptographic transaction hashes mimicking Ethereum and Polygon networks to replicate immutable auditing.
*   **Chain of Custody Tracking**: Logs all user interactions, transfers, and file verifications. 
*   **Role-Based Dashboards**: Tracks metrics, recent custody transfers, and digital cases across an interactive UI.
*   **Fully Portable Database**: Uses embedded NeDB NoSQL, meaning no external database setups or docker containers are required.

## 💻 Tech Stack

### Frontend
- **React.js 18** + **Vite**
- **React Router v6** (Protected and nested routing)
- **Chart.js** & **React-Chartjs-2** (Analytics and metrics)
- **Lucide React** (Vector iconography)

### Backend
- **Node.js** + **Express.js**
- **NeDB** (In-memory/local JSON doc-store native to Node)
- **JWT** (Authentication) + **Bcrypt.js** (Password hashing)
- **Multer** (Evidence payload file handling)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- NPM or Yarn

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

**Seed the Database:**
To populate the NeDB database with dummy users, mock cases, and evidence, run the seeding script:
```bash
npm run seed
```

**Start the API Server:**
```bash
npm run dev
# Server will launch at http://localhost:5000
```

### 2. Frontend Setup

Open a new, separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

**Start the Development Server:**
```bash
npm run dev
# Application will launch safely at http://localhost:5173
```

## 🔐 Default Credentials

If you have executed the `npm run seed` command on the backend, you can log into the local platform with any of the dummy accounts:

*   **Email:** `admin@system.gov`
*   **Password:** `password123`

*(Other pre-seeded roles include `john@police.gov`, `sarah@forensics.gov`, and `james@court.gov`—all using the same `password123` password.)*

## 📁 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express server configuration
│   │   ├── database.js            # NeDB instances
│   │   ├── seed.js                # Sandbox environment builder
│   │   ├── middleware/            # JWT validation and generic checks
│   │   ├── routes/                # API endpoint controllers
│   │   └── services/              # Blockchain Simulator & Node Crypto hashing
│   └── package.json
└── frontend/
    ├── src/
    │   ├── layouts/               # Dashboard App frame & Sidebar
    │   ├── pages/                 # Full screens (Evidence, Ledger, Analytics)
    │   ├── context/               # React Context for session management
    │   └── index.css              # Custom UI & variable configurations
    ├── vite.config.js
    └── package.json
```

## ⚖️ License
This project is for educational and developmental mock-up purposes.
