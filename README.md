# CampusPulse — AI-Powered Campus Issue Intelligence Platform

> **Turn Campus Problems Into Campus Intelligence.**

CampusPulse transforms scattered student feedback into prioritized, actionable insights so institutions can identify problems faster, respond smarter, and build better campuses.

**Not another complaint portal.** It's **Complaint Collection + AI Understanding + Duplicate Detection + Issue Clustering + Recurrence Detection + Explainable Prioritization + SLA Intelligence + Predictive Alerts + Campus Heatmap + AI Recommendations**

---

## Problem Statement
Students report issues via WhatsApp, email, paper notes — scattered, duplicated, no priority. Admins overwhelmed, critical issues like "No water in Hostel B" buried under low-priority requests. No visibility on recurring patterns, no SLA, no heatmap, no intelligence.

## Solution
CampusPulse centralizes reports and adds AI intelligence:

1. **Understand** complaint via NLP (local fallback + OpenAI)
2. **Classify** into Water, Electricity, Wi-Fi, Hostel, Transport, Food, etc.
3. **Analyze** severity, sentiment, affected users
4. **Detect duplicates** via TF-IDF cosine + location/category/time similarity (thresholds >0.85 likely, 0.65-0.85 related)
5. **Group** into clusters like *Hostel B Water Crisis — 47 reports, 630 affected, CRITICAL*
6. **Detect recurring** patterns: Jan 4 Wi-Fi, Feb 8, Mar 13, Apr 21 → flag recurring
7. **Calculate explainable priority**: `Priority = Severity×30 + Affected×25 + Recurrence×20 + Urgency×15 + Sentiment×10` normalized 0-100 with reasons
8. **Recommend department** and auto-assign
9. **Track SLA**: Critical 15m response/2h resolution, High 1h/8h, Medium 4h/24h, Low 24h/72h with warnings/breaches via Socket.IO
10. **Notify** real-time, **visualize** heatmap via React Leaflet, **predict** spikes, **recommend actions**

Central question answered: **What campus problem should be solved first, why is it important, and what action should be taken?**

---

## Features

- Multi-tenant: Organization → Campus → Department → Users → Issues (tenant isolation on every doc)
- Roles: STUDENT (report anonymously, vote, follow, confirm), FACULTY, DEPARTMENT_ADMIN, CAMPUS_ADMIN, SUPER_ADMIN
- Issue wizard 8 steps: Title, Location (Leaflet map + building/block/floor/room), Category (AI suggest), Impact, Urgency, Evidence upload, Privacy (Public/Private/Anonymous), AI Preview (category, severity, urgency, affected, dept, duplicate prob, priority)
- Status workflow: NEW → TRIAGED → ASSIGNED → IN_PROGRESS → WAITING → RESOLVED → CLOSED → REOPENED/REJECTED with visual timeline
- Voting: 184 people affected, prevent duplicates, signal impact
- Comments real-time via Socket.IO
- Anonymous reporting privacy-respected
- Priority Queue: "WHAT SHOULD WE FIX FIRST?" #1 Water outage Hostel B Priority 96 Affected 430 Recurrence High SLA 1h42m
- Heatmap: intensity by count/severity/priority, filters, click hotspot → Building Issues, Critical, Affected, Top Category
- Analytics: Recharts issues over time, by category/dept, resolution time, priority distribution, SLA performance, sentiment trends, recurring, health score
- Trends: increasing/decreasing/stable/spikes with % (Internet +43% this week)
- Predictive alerts: "Wi-Fi congestion expected Monday 9-11 AM" from historical pattern
- AI Recommendations panel: Investigate pipeline, Evidence 47 reports 630 affected recurring 3 weeks negative sentiment, Action schedule inspection 2h
- Campus Health Score 0-100 from unresolved, critical, SLA, resolution time, recurrence, sentiment, volume
- Search & filtering: title, description, ID, building, category, dept + filters status/priority/category/dept/building/date/SLA/anonymous/recurring/duplicate + pagination
- File uploads JPG PNG WEBP PDF validated MIME + size, Cloudinary or local
- Real-time: Socket.IO events issue.created, issue.updated, issue.assigned, issue.statusChanged, issue.commentAdded, issue.resolved, notification.created, sla.warning, sla.breached
- Audit log: creation, assignment, status, comments, merging, resolution, admin actions

## Tech Stack

**Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Framer Motion, Recharts, React Leaflet, Socket.IO Client, React Hook Form, Zod, Sonner

**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Socket.IO, Multer, Helmet, CORS, express-rate-limit, Morgan/Winston, dotenv, Cloudinary, OpenAI

**AI**: Independent service layer `services/ai/` with OpenAI API + deterministic fallback keyword mapping (water/pipeline/tap → Water, wifi/internet/router → Internet, etc). Never hard-code keys. Display AI Mode: Local Intelligence vs Enhanced Intelligence.

**Architecture**: Frontend ↓ REST API ↓ Express ↓ Controllers ↓ Services ↓ MongoDB + Socket.IO real-time + AI separate service layer + clean modular code.

## Project Structure
```
CampusPulse/
 frontend/ src/{components/{ui,common,issues,admin}, pages/{auth,issues,admin}, layouts, hooks, services, context, utils, routes, charts, App.jsx}
 backend/ src/{config, controllers, middleware, models, routes, services/{ai, priority, duplicate, analytics, sla}, sockets, utils, validators, seeds, app.js} server.js
 docs/ architecture.md api.md database.md deployment.md
 docker-compose.yml README.md .gitignore
```

## Installation

```bash
# Clone
git clone <repo> && cd CampusPulse

# Backend
cd backend
cp .env.example .env
# Edit MONGO_URI, JWT_SECRET, CLIENT_URL, OPENAI_API_KEY (optional), CLOUDINARY
npm install
npm run seed   # creates demo accounts and 120+ issues
npm run dev    # port 5000

# Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev    # port 5173
```

## Environment Variables

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Backend `.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/campuspulse
JWT_SECRET=your_super_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=  # optional, fallback works without
AI_MODEL=gpt-4o-mini
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## MongoDB Setup
- Local: `mongod` + `mongodb://localhost:27017/campuspulse`
- Atlas: Create cluster, whitelist IP, get URI

## AI Setup
- Without key: Local deterministic intelligence keyword mapping works fully, UI shows "AI Mode: Local Intelligence"
- With key: Set OPENAI_API_KEY, get Enhanced Intelligence classification, sentiment, summary

## Cloudinary Setup (Optional)
- Create account, get cloud name/key/secret, add to env. If not set, uploads stored locally in /uploads for demo.

## Demo Credentials
- Student: student@campuspulse.demo / Student@123
- Campus Admin: admin@campuspulse.demo / Admin@123
- Department Admin: department@campuspulse.demo / Department@123

Seed script creates 3 campuses, 10 departments (IT, Hostel, Electrical, Maintenance, Transport, Food Services, Security, Academic, Library, Administration), 50 users, 100+ issues including duplicates (No water Hostel B vs Hostel Block B water supply stopped), recurring, critical, resolved, SLA breaches, comments, votes, notifications.

## API Documentation
See docs/api.md — full REST list + Socket.IO events.

## Deployment
See docs/deployment.md — Vercel frontend, Render/Railway backend, MongoDB Atlas, OpenAI, Cloudinary. Docker Compose provided for local full-stack.

```bash
docker-compose up --build
```

## Testing Real-World Workflow
Student reports: "Hostel Block B has no water since 6 AM."
1. Receive report
2. AI analyzes description
3. Detect Water category
4. Detect Hostel location
5. Estimate severity 8
6. Estimate affected 200
7. Analyze sentiment negative
8. Search previous issues
9. Detect related reports
10. Attach/create cluster Hostel B Water Crisis
11. Calculate priority 94
12. Explain priority reasons
13. Identify Hostel Maintenance department
14. Create SLA 2h resolution
15. Notify administrator real-time
16. Display in Priority Queue #1
17. Display on Heatmap hotspot
18. Notify dept admin
19. Dept updates status → students real-time update
20. Dept uploads resolution evidence
21. Student confirms resolution → Closed
22. Analytics update
23. System checks recurring pattern

## Screenshots Section
Add screenshots of Landing, Student Dashboard, Issue Wizard AI Preview, Issue Detail with priority explanation, Priority Queue, Heatmap, Analytics, AI Insights.

## Future Roadmap
- Mobile app React Native
- Push notifications FCM
- Advanced ML embedding model for duplicate detection (sentence-transformers)
- Auto-routing with staff availability
- Voice reporting
- Multilingual support
- Integration with ERP

## Security
JWT, bcrypt, Helmet, CORS, rate limiting, input validation Zod, sanitization mongoSanitize xss-clean, RBAC, tenant isolation, secure headers, file validation, centralized error handling, no secrets in code.

## License
MIT — Built for college project, hackathon, startup MVP, portfolio, university deployment.
