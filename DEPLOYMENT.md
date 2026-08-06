# QuantEdge - Deployment Guide

> Zero-cost deployment using free tiers only.
> Last updated: 2026-08-06

---

## Tech Stack at a Glance

| Layer | Technology | Free Tier Used |
|-------|-----------|---------------|
| Backend | Spring Boot 3.3 / Java 25 | N/A (self-hosted) |
| Frontend | Next.js 14 / Node 24 | N/A (self-hosted) |
| Database | PostgreSQL 18 | Neon.tech free tier (0.5 GB) |
| Cache | Caffeine L1 (in-process) | N/A (no Redis needed locally) |
| Auth | JWT HS512 | N/A |
| AI | Google Gemini Flash | Free API tier (1500 req/day) |
| Market Data | Finnhub + Alpha Vantage | Free API tiers |
| Email | Resend | Free tier (100 emails/day) |

---

## Option 1 - Local Development (Recommended)

### Prerequisites
- Java 21+ (JDK 25 recommended)
- Node.js 20+
- Maven 3.9+
- A Neon.tech account (free) OR local PostgreSQL

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge

# 2. Set up database
# Option A: Use Neon.tech (free) - create a project at https://neon.tech
# Option B: Local PostgreSQL: createdb quantedge

# 3. Build the backend JAR
cd apps/backend
mvn package -DskipTests

# 4. Run the backend
java -jar target/quantedge-backend-1.0.0.jar \
  --spring.profiles.active=local \
  --spring.datasource.url=jdbc:postgresql://YOUR_DB_HOST/neondb?sslmode=require \
  --spring.datasource.username=YOUR_DB_USER \
  --spring.datasource.password=YOUR_DB_PASSWORD \
  --jwt.secret=your_64_char_secret_key_here_abcdefghijklmnopqrstuvwxyz123456

# 5. Run the frontend (in a new terminal)
cd frontend
npm install
npm run dev

# 6. Open the app
# Frontend:  http://localhost:3000
# API:       http://localhost:8080/api/v1
# Swagger:   http://localhost:8080/swagger-ui.html
```

### Environment Variables Reference

#### Backend (passed as --flag or in application-local.properties)
```
spring.datasource.url=jdbc:postgresql://HOST/DB?sslmode=require
spring.datasource.username=USERNAME
spring.datasource.password=PASSWORD
jwt.secret=64+_char_hs512_secret

# Optional - market data (free tiers)
finnhub.api-key=YOUR_FINNHUB_KEY      # https://finnhub.io/register
alphavantage.api-key=YOUR_AV_KEY      # https://www.alphavantage.co/support/#api-key

# Optional - AI features
gemini.api-key=YOUR_GEMINI_KEY        # https://aistudio.google.com/apikey

# Optional - email
resend.api-key=YOUR_RESEND_KEY        # https://resend.com
resend.from-email=noreply@yourdomain.com
```

#### Frontend (.env.local in /frontend)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## Option 2 - Docker Compose (Full Stack Local)

### Prerequisites
- Docker Desktop installed

### Steps

```bash
# Clone
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge

# Create .env file from template
copy .env.example .env
# Edit .env with your API keys and DB credentials

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

### Services Started
| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432/quantedge |
| Redis (optional) | 6379 | localhost:6379 |

---

## Option 3 - Render.com Free Tier (Cloud, Rs.0)

### Services to Create on render.com

1. **PostgreSQL** - Render free tier (1 GB, sufficient for dev)
2. **Backend** - Web Service -> Docker -> `./apps/backend/Dockerfile`
3. **Frontend** - Static Site OR Web Service -> Docker -> `./frontend/Dockerfile`

### Steps

1. Go to [render.com](https://render.com) and create a free account
2. New -> PostgreSQL -> free plan -> copy the connection string
3. New -> Web Service -> connect your GitHub repo
   - Root directory: `apps/backend`
   - Docker build
   - Environment variables: (paste your DB URL, JWT secret, API keys)
4. New -> Static Site -> connect repo
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`

### Render Environment Variables (Backend)
```
SPRING_DATASOURCE_URL=postgresql://user:pass@host/db?sslmode=require
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass
JWT_SECRET=your_64_char_secret
FINNHUB_API_KEY=your_key
GEMINI_API_KEY=your_key
```

---

## Running Automated Tests

```powershell
# Ensure backend is running on :8080 and frontend on :3000
# Then run the full test suite:
powershell -ExecutionPolicy Bypass -File run_tests.ps1
```

### Expected Output (all services healthy)
```
=======================================================
  QUANTEDGE AUTO TEST RESULTS
=======================================================
  PASSED  : 48
  FAILED  : 0
  SKIPPED : 0
  TOTAL   : 48
  PASS %  : 100%
=======================================================
```

---

## Notes on Free API Keys

| Service | Free Tier Limit | Required For |
|---------|----------------|--------------|
| Neon.tech | 0.5 GB storage, shared compute | Database (REQUIRED) |
| Finnhub | 60 calls/min | Live stock quotes |
| Alpha Vantage | 25 calls/day | Historical charts |
| Google Gemini | 1500 req/day (Flash) | All AI features |
| Resend | 100 emails/day | Registration emails |

> **Note:** The app works without API keys in local dev mode. Market data endpoints will return 503 (gracefully), AI endpoints will return 503, and email verification is logged to console instead of sent.