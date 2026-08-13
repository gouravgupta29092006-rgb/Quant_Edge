# QuantEdge - Deployment Guide

> Zero-cost deployment using free tiers only.
> Last updated: 2026-08-13

---

## Tech Stack

| Layer | Technology | Free Tier |
|-------|-----------|-----------|
| Backend | Spring Boot 3.3 / Java 25 | Self-hosted |
| Frontend | Next.js 14 / Node 24 | Self-hosted |
| Database | PostgreSQL 18 | Neon.tech (0.5 GB free) |
| Cache | Caffeine L1 (in-process) | No Redis needed locally |
| Auth | JWT HS512 | Built-in |
| AI | Google Gemini Flash | 1500 req/day free |
| Market Data | Finnhub + Alpha Vantage | Free API tiers |
| Email | Resend | 100 emails/day free |

---

## Quick Start (Local)

### Prerequisites
- Java 21+ (JDK 25 recommended)
- Node.js 20+
- Maven 3.9+
- A Neon.tech account (free) for PostgreSQL

### 1. Clone & Configure

```bash
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge

# Copy environment template and fill in your credentials
copy .env.example .env
# Edit .env with your Neon.tech DB URL, JWT secret, and optional API keys
```

### 2. Build Backend

```bash
cd apps/backend
mvn package -DskipTests
```

### 3. Start Backend (Terminal 1)

```powershell
java -jar apps\backend\target\quantedge-backend-1.0.0.jar `
  --spring.profiles.active=local `
  --spring.datasource.url="YOUR_NEON_DB_URL" `
  --spring.datasource.username="YOUR_DB_USER" `
  --spring.datasource.password="YOUR_DB_PASSWORD" `
  --jwt.secret="YOUR_64_CHAR_JWT_SECRET"
```

Wait for: `Started QuantEdgeApplication` (~35-40 seconds)

### 4. Start Frontend (Terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

### 5. Open the App

| Service | URL |
|---------|-----|
| App (Frontend) | http://localhost:3000 |
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## Windows Quick Launch

Use `start.bat` in the project root - it loads credentials from your `.env` file automatically:

```
Double-click start.bat
```

> IMPORTANT: You must create `.env` from `.env.example` first.

---

## Option 2 - Docker Compose (Full Stack)

### Prerequisites
- Docker Desktop installed

```powershell
# Clone and configure
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge
copy .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up -d

# Check status
docker compose ps
```

| Service | Port |
|---------|------|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

---

## Option 3 - Render.com Free Tier (Cloud)

1. Go to [render.com](https://render.com) - create free account
2. New -> PostgreSQL -> free plan -> copy connection string
3. New -> Web Service -> connect GitHub repo
   - Root: `apps/backend`, Docker build
   - Env vars: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, `CORS_ALLOWED_ORIGINS`
4. New -> Static Site -> connect GitHub repo
   - Root: `frontend`, build: `npm run build`, publish: `.next`
   - Env vars: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1`

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | YES | PostgreSQL JDBC URL (Neon.tech) |
| `SPRING_DATASOURCE_USERNAME` | YES | DB username |
| `SPRING_DATASOURCE_PASSWORD` | YES | DB password |
| `JWT_SECRET` | YES | 64+ char random string for JWT signing |
| `CORS_ALLOWED_ORIGINS` | NO | Frontend URL (default: http://localhost:3000) |
| `FINNHUB_API_KEY` | NO | Live stock quotes (https://finnhub.io) |
| `ALPHA_VANTAGE_API_KEY` | NO | Historical charts (https://alphavantage.co) |
| `GEMINI_API_KEY` | NO | AI features (https://aistudio.google.com) |
| `RESEND_API_KEY` | NO | Email delivery (https://resend.com) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | YES | Backend API base URL |
| `NEXT_PUBLIC_WS_URL` | NO | WebSocket URL for real-time quotes |

---

## Running Automated Tests

After both services are running:

```powershell
powershell -ExecutionPolicy Bypass -File run_tests.ps1
```

Expected result: **48/48 PASSED - 100%**

---

## Security Notes

- Never commit `.env` (it is in `.gitignore`)
- Use a strong random JWT secret in production (64+ chars)
- Set `CORS_ALLOWED_ORIGINS` to your exact frontend URL in production
- See `SECURITY.md` for full security architecture and trade-offs

---

## Free API Keys

| Service | Limit | Sign Up |
|---------|-------|---------|
| Neon.tech | 0.5 GB storage | https://neon.tech |
| Finnhub | 60 calls/min | https://finnhub.io/register |
| Alpha Vantage | 25 calls/day | https://alphavantage.co |
| Google Gemini | 1500 req/day | https://aistudio.google.com |
| Resend | 100 emails/day | https://resend.com |

> The app runs without any API keys. Market data returns 503 gracefully; AI features return 503; emails log to console instead of sending.