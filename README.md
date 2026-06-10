# MediSync — Enterprise Patient Appointment Management Platform

> A production-ready healthcare SaaS platform inspired by Practo, Apollo 24/7, and Zocdoc.

![MediSync Banner](https://via.placeholder.com/1200x400/0891b2/ffffff?text=MediSync+Healthcare+Platform)

## 🚀 Features

### Roles
| Role | Capabilities |
|------|-------------|
| **Super Admin** | Manage hospitals, doctors, patients, analytics, settings |
| **Doctor** | View schedule, confirm/reject appointments, add notes, manage availability |
| **Patient** | Register, search doctors, book/reschedule/cancel appointments, view history |

### Highlights
- 🎨 **Premium UI** — Glassmorphism, gradient cards, animated counters, dark mode
- 📊 **Live Analytics** — Revenue charts, appointment trends, doctor performance
- 🔐 **JWT Auth** — Access + refresh tokens, RBAC, bcrypt hashing
- 📅 **Smart Scheduling** — Dynamic slot generation, conflict detection
- 🔔 **Notifications** — In-app notification bell with drawer
- 📱 **Mobile Friendly** — Fully responsive layout

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + MUI + Recharts + Framer Motion + Zustand |
| Backend | Python 3.11 + FastAPI + SQLAlchemy + Alembic |
| Database | MySQL 8 |
| Cache | Redis |
| DevOps | Docker + Docker Compose + Nginx |

---

## ⚡ Quick Start

### Prerequisites
- Docker Desktop ≥ 24
- Docker Compose ≥ 2

### 1. Clone & Configure
```bash
git clone https://github.com/yourname/medisync.git
cd medisync

cp .env.example .env
# Edit .env and set your values (or use defaults for local dev)
```

### 2. Start Everything
```bash
docker compose up --build
```

First boot takes ~2 minutes. The backend auto-creates tables and seeds demo data.

### 3. Access
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@medisync.health | Admin@2024 |
| Doctor | dr.priya@medisync.health | Doctor@2024 |
| Doctor | dr.rajesh@medisync.health | Doctor@2024 |
| Patient | patient@medisync.health | Patient@2024 |

---

## 📁 Project Structure

```
medisync/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── init.sql                    # Database schema + seed data
│   └── app/
│       ├── main.py                 # FastAPI app + startup seeder
│       ├── core/
│       │   ├── config.py           # Pydantic settings
│       │   └── security.py         # JWT + bcrypt
│       ├── database/session.py     # SQLAlchemy engine + session
│       ├── models/models.py        # All ORM models
│       ├── schemas/schemas.py      # All Pydantic schemas
│       ├── middleware/auth.py      # JWT dependency injection + RBAC
│       └── api/v1/endpoints/
│           ├── auth.py             # /auth/* routes
│           ├── appointments.py     # /appointments/* routes
│           ├── doctors.py          # /doctors/* routes
│           ├── analytics.py        # /analytics/* routes
│           └── notifications.py    # /notifications/* + /patients/* routes
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                 # Router + role-based redirects
        ├── store/authStore.js      # Zustand auth state
        ├── services/api.js         # Axios + all API methods
        ├── utils/theme.js          # MUI light/dark themes
        ├── components/
        │   ├── layout/DashboardLayout.jsx
        │   └── common/StatCard.jsx
        └── pages/
            ├── auth/LoginPage.jsx
            ├── auth/RegisterPage.jsx
            ├── admin/AdminDashboard.jsx
            ├── patient/PatientDashboard.jsx
            ├── patient/DoctorSearch.jsx
            ├── patient/BookAppointment.jsx
            ├── doctor/DoctorDashboard.jsx
            └── shared/
                ├── AppointmentsList.jsx
                ├── AppointmentDetail.jsx
                ├── ProfilePage.jsx
                └── NotFoundPage.jsx
```

---

## 🗄 Database Schema

```
users ─────────── roles
  │
  ├── patients
  ├── doctors ──── specializations
  │                 └── doctor_availability
  │
appointments ──── consultations
  │
  ├── notifications
  └── audit_logs
```

Key tables: `users`, `roles`, `patients`, `doctors`, `doctor_availability`, `appointments`, `consultations`, `notifications`, `audit_logs`, `system_settings`, `hospitals`, `specializations`, `doctor_reviews`

---

## 🔌 API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login → access + refresh tokens |
| POST | `/api/v1/auth/register` | Register new patient |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |

### Appointments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/appointments` | List appointments (filtered by role) |
| POST | `/api/v1/appointments` | Book appointment |
| GET | `/api/v1/appointments/{id}` | Get appointment detail |
| PATCH | `/api/v1/appointments/{id}` | Update appointment |
| GET | `/api/v1/appointments/slots/{doctor_id}` | Get available slots |

### Doctors
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/doctors` | List/search doctors |
| GET | `/api/v1/doctors/{id}` | Doctor profile |
| GET | `/api/v1/doctors/specializations` | All specializations |
| PATCH | `/api/v1/doctors/{id}/availability` | Toggle availability |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/admin/dashboard` | Admin KPIs |
| GET | `/api/v1/analytics/admin/monthly-trend` | 6-month trend |
| GET | `/api/v1/analytics/patient/dashboard` | Patient stats |
| GET | `/api/v1/analytics/doctor/dashboard` | Doctor stats |

Full interactive docs at **http://localhost:8000/docs**

---

## ☁️ Cloud Deployment

### Oracle Cloud Free Tier (Recommended)
```bash
# 1. Create a VM.Standard.A1.Flex (4 OCPU, 24 GB RAM — always free)
# 2. SSH into the instance
# 3. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 4. Clone and start
git clone https://github.com/yourname/medisync.git
cd medisync
cp .env.example .env
# Edit .env with production values
docker compose up -d --build

# 5. Open firewall ports 80, 443, 3000, 8000 in OCI security lists
```

### AWS EC2
```bash
# t3.small or t3.medium (free tier eligible)
# Same Docker steps as above
# Configure Security Group to allow 80, 443, 3000, 8000
```

### Environment Variables (Production)
```env
SECRET_KEY=<generate with: openssl rand -hex 32>
DATABASE_URL=mysql+pymysql://medisync:STRONG_PASSWORD@db:3306/medisync_db
MYSQL_ROOT_PASSWORD=<strong-root-password>
MYSQL_PASSWORD=<strong-password>
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
```

### Add Nginx Reverse Proxy (Production)
Point Nginx to `localhost:3000` (frontend) and `localhost:8000` (API), add SSL via Certbot.

---

## 🔒 Security Notes

- JWT tokens expire in 30 minutes; refresh tokens in 7 days
- All passwords hashed with bcrypt (12 rounds)
- CORS restricted to configured origins in production
- SQL injection prevented via SQLAlchemy ORM parameterization
- Input validated with Pydantic schemas

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ using FastAPI + React + MUI*
