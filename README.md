# Real-Time Multi-Agent Adaptive Recommendation Web Platform Using Deep RL

**M.Tech Project — Computer Science & Engineering**

---

## Abstract

A research-driven full-stack web ecosystem where each user is represented by an autonomous RL agent that evolves personalized recommendation strategies. The system implements Q-Learning with ε-greedy exploration, reward-driven feedback loops, real-time event streaming via Socket.IO, and dynamic user-specific policy adaptation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  Dashboard | Recommendations | Items | Agent Monitor │
└────────────────────┬────────────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────▼────────────────────────────────┐
│              Backend (Node.js + Express)             │
│  Auth Routes | Item CRUD | Recommendation Engine     │
│            RL Engine (Q-Learning Core)               │
└────────────────────┬────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────┐
│                   MongoDB Atlas                      │
│      Users (agent state) | Items | Interactions      │
└─────────────────────────────────────────────────────┘
```

---

## Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Responsive Web Application | ✅ React + CSS Grid |
| 2 | CRUD Operations | ✅ Items (Create/Read/Update/Delete) |
| 3 | Database Connectivity | ✅ MongoDB via Mongoose |
| 4 | Secure Authentication | ✅ JWT + bcrypt |
| 5 | Deployment Ready | ✅ Docker + Nginx |
| 6 | Deep RL Engine | ✅ Q-Learning with ε-greedy |
| 7 | Real-Time Streaming | ✅ Socket.IO |
| 8 | Multi-Agent Monitoring | ✅ Admin dashboard |

---

## RL Algorithm

**Q-Learning (Off-Policy Temporal Difference)**

```
Q(s,a) ← Q(s,a) + α [r + γ · max Q(s',a') - Q(s,a)]
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| α (alpha) | 0.1 | Learning rate |
| γ (gamma) | 0.9 | Discount factor |
| ε (epsilon) | 1.0 → 0.05 | Exploration decay |
| ε decay | 0.995/step | Epsilon decay rate |

**Reward Signal:**
| Action | Reward |
|--------|--------|
| click | +1.0 |
| like | +2.0 |
| save | +1.5 |
| share | +3.0 |
| purchase | +5.0 |
| skip | -0.5 |
| ignore | -1.0 |

---

## Project Structure

```
mtech-project/
├── backend/
│   ├── server.js              # Express + Socket.IO server
│   ├── models/
│   │   ├── User.js            # User schema with agent state
│   │   └── Item.js            # Item catalogue schema
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Profile
│   │   ├── items.js           # CRUD operations
│   │   ├── recommendations.js # RL-powered recommendations
│   │   └── agents.js          # Admin agent monitoring
│   ├── middleware/
│   │   └── auth.js            # JWT protect + admin guard
│   ├── rl_engine/
│   │   └── rewardEngine.js    # Q-Learning core
│   ├── scripts/
│   │   └── seed.js            # Database seeder
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js             # Router + auth guards
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js   # Real-time charts + live feed
│   │   │   ├── Recommendations.js  # RL agent items + feedback
│   │   │   ├── Items.js       # Browse + admin CRUD
│   │   │   ├── AgentMonitor.js    # Admin multi-agent view
│   │   │   └── Profile.js     # User preferences
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── store/
│   │   │   └── AuthContext.js
│   │   └── utils/
│   │       └── api.js         # Axios API layer
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Setup & Run

### Option 1: Local Development

**Prerequisites:** Node.js 18+, MongoDB running locally

```bash
# Backend
cd backend
npm install
cp .env.example .env
node scripts/seed.js   # Seed demo data
npm run dev            # Port 5000

# Frontend (new terminal)
cd frontend
npm install
npm start              # Port 3000
```

### Option 2: Docker (Recommended)

```bash
docker-compose up --build
```

Access: http://localhost:3000

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mtech.edu | admin123 |
| Student | student@mtech.edu | student123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| PUT | /api/auth/me | Update profile |

### Items (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List with pagination + search |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create (admin only) |
| PUT | /api/items/:id | Update (admin only) |
| DELETE | /api/items/:id | Delete (admin only) |

### Recommendations (RL)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/recommendations | Get personalized recs |
| POST | /api/recommendations/feedback | Submit interaction |
| GET | /api/recommendations/agent-stats | Agent state + history |

### Agents (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agents | All agent states |
| GET | /api/agents/metrics | System-wide RL metrics |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| RL Engine | Custom Q-Learning (vanilla JS) |
| Deployment | Docker, Nginx, Docker Compose |

---

## Research Contributions

1. **Per-user Q-table persistence** — each user's agent state stored in MongoDB and loaded across sessions
2. **Session-based interaction modeling** — interaction history drives temporal reward attribution
3. **ε-greedy decay scheduling** — exploration naturally decays as agent gains confidence
4. **Real-time reward broadcasting** — Socket.IO enables live policy updates across connected clients
5. **Multi-agent monitoring** — admin dashboard provides system-level convergence view

---

*Submitted for M.Tech Computer Science & Engineering | Academic Year 2024-25*
