# BloodConnect

An emergency blood donor coordination platform that connects donors, recipients, hospitals, and blood banks in real time.

**Live:** http://blood-connect.duckdns.org

---

## Overview

BloodConnect addresses the critical gap between blood donors and those in urgent need. The platform enables real-time matching based on blood type and location, manages blood bank inventory, and keeps all parties notified through live socket connections.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Socket.IO Client |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB (Atlas) |
| Maps | Leaflet / React-Leaflet |
| Auth | JWT (httpOnly cookies, refresh token rotation) |
| Email | Nodemailer (SMTP) |
| Process Manager | PM2 |
| Reverse Proxy | nginx |
| Hosting | AWS EC2 (Amazon Linux 2023, t3.nano) |
| CI/CD | GitHub Actions |
| DNS | DuckDNS (free dynamic DNS) |

---

## Features

- **Role-based access** — donor, recipient, hospital, blood bank admin, super admin
- **Blood request management** — create, track, and respond to urgent requests
- **Real-time notifications** — Socket.IO powered live updates across all roles
- **Geolocation matching** — find nearby donors and blood banks on an interactive map
- **Blood bank inventory** — manage and monitor blood type stock levels
- **Donation tracking** — 56-day cooldown enforcement, donation history
- **JWT auth** — access + refresh token rotation via httpOnly cookies
- **Automated cron jobs** — eligibility reminders and request expiry
- **Rate limiting** — per-IP request throttling via express-rate-limit

---

## Project Structure

```
BloodConnect/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios API layer
│   │   ├── components/      # Shared UI components
│   │   ├── hooks/           # Custom hooks (socket, geolocation)
│   │   ├── pages/           # Role-based page views
│   │   ├── store/           # Zustand state stores
│   │   └── utils/           # Constants, formatters, helpers
│   └── dist/                # Production build (generated)
├── server/                  # Express backend
│   ├── config/              # DB and Socket.IO setup
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # Mongoose models
│   ├── routes/              # API route definitions
│   ├── services/            # Email and cron services
│   └── utils/               # JWT helpers, geo queries
├── scripts/
│   └── setup-ec2.sh         # One-time EC2 provisioning script
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions CI/CD pipeline
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Setup

```bash
# Clone the repo
git clone https://github.com/jiteshiscreator/BloodConnect.git
cd BloodConnect

# Install server dependencies
cd server && npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values

# Install client dependencies
cd ../client && npm install
```

### Run

```bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Frontend proxies `/api` and `/socket.io` to `http://localhost:5000` via Vite's dev proxy.

---

## Environment Variables

Create `server/.env` from `server/.env.example`:

```env
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bloodproject

JWT_ACCESS_SECRET=<64+ char random string>
JWT_REFRESH_SECRET=<64+ char random string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="BloodConnect <your@gmail.com>"

CLIENT_URL=http://blood-connect.duckdns.org
COOKIE_SECURE=false
```

Generate JWT secrets:
```bash
node -e "const c=require('crypto'); console.log(c.randomBytes(64).toString('hex'))"
```

---

## Production Architecture

```
Browser
  │
  ▼
DuckDNS (blood-connect.duckdns.org → 98.93.14.217)
  │
  ▼
AWS EC2 — t3.nano, Amazon Linux 2023
  │
  ▼
nginx (port 80)
  ├── /api/*        → proxy → Node.js :5000
  ├── /socket.io/*  → proxy → Node.js :5000 (WebSocket upgrade)
  └── /*            → serve → client/dist (React SPA)
  │
  ▼
PM2 → node server.js (auto-restart on crash, survives reboots)
  │
  ▼
MongoDB Atlas (free tier, US East)
```

---

## CI/CD — GitHub Actions

Every push to `main` triggers an automatic deployment:

1. **Build** — React frontend built on the GitHub Actions runner (avoids t3.nano memory limits)
2. **Sync** — `rsync` pushes all files to EC2, excluding `node_modules` and `.env`
3. **Deploy** — SSH into EC2, runs `npm ci --omit=dev`, restarts PM2

**Required GitHub Secrets** (`Settings → Secrets → Actions`):

| Secret | Value |
|---|---|
| `EC2_HOST` | `98.93.14.217` |
| `EC2_KEY` | Full contents of the `.pem` key file |

---

## EC2 First-Time Setup

To provision a fresh Amazon Linux 2023 instance:

```bash
ssh -i bloodconnect.pem ec2-user@<ip> 'bash -s' < scripts/setup-ec2.sh
```

This installs Node.js 22, PM2, nginx, configures the reverse proxy, and sets up PM2 to survive reboots.

After setup, manually create `server/.env` on the instance with production values, then:

```bash
cd ~/BloodConnect/server
pm2 start server.js --name bloodconnect
pm2 save
```

---

## DNS — DuckDNS

The domain `blood-connect.duckdns.org` is managed via [DuckDNS](https://www.duckdns.org) — a free dynamic DNS service.

**If the EC2 IP changes** (instance stop/start):
1. Go to duckdns.org
2. Update the IP for `blood-connect` to the new public IPv4 address

> Note: Elastic IPs prevent this but incur AWS charges. For a free setup, update DuckDNS manually when needed.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/users/profile` | Get current user |
| GET/POST | `/api/requests` | Blood requests |
| GET/POST | `/api/donations` | Donations |
| GET/POST | `/api/bloodbanks` | Blood bank management |
| GET/PATCH | `/api/notifications` | Notifications |

---

## License

MIT
