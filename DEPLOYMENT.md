# QuantEdge Deployment Guide
> ₹0 cost deployment using free tiers only.

## Option 1 — Local Docker Compose (Recommended for Development)

### Prerequisites
- Docker Desktop installed
- API keys for Finnhub + Alpha Vantage (both have free tiers)

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge

# 2. Copy and fill environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services
docker compose up -d

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1
# Swagger UI: http://localhost:8080/swagger-ui.html
```

## Option 2 — Render.com Free Tier (₹0 cloud hosting)

### Services to create on render.com:
1. **PostgreSQL** — Render free tier (1 GB, sufficient for dev/portfolio)
2. **Redis** — Render free tier (25 MB, sufficient for caching)
3. **Backend** — Web Service → Docker → `./apps/backend/Dockerfile`
4. **Frontend** — Web Service → Docker → `./frontend/Dockerfile`

### Steps
1. Go to [render.com](https://render.com) and create a free account
2. Create a **PostgreSQL** instance → copy connection URL
3. Create a **Redis** instance → copy connection URL
4. Create Web Service for backend:
   - Build Command: Docker
   - Dockerfile path: `./apps/backend/Dockerfile`
   - Set environment variables (copy from .env.example)
5. Create Web Service for frontend:
   - Build Command: Docker
   - Dockerfile path: `./frontend/Dockerfile`
   - Set `NEXT_PUBLIC_API_URL` to your backend Render URL

### Render.com Free Tier Limits
| Service | Free Limit |
|---|---|
| Web Services | 2 services |
| PostgreSQL | 1 GB storage, expires after 90 days (re-create) |
| Redis | 25 MB |
| Bandwidth | 100 GB/month |
| Compute | 750 hours/month |

> **Note:** Free services spin down after 15 min of inactivity. First load may be slow.

## Option 3 — Railway.app (₹0 for students)

Railway offers $5/month free credit which is sufficient for all QuantEdge services.

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

## AI Integration (Ollama)

For AI features to work, Ollama must be running:

```bash
# Install Ollama (free, no API key)
# macOS/Linux: curl -fsSL https://ollama.ai/install.sh | sh
# Windows: Download from https://ollama.ai

# Pull a model (one-time)
ollama pull mistral   # ~4GB, runs on CPU

# Start Ollama
ollama serve         # Runs on http://localhost:11434
```

Set `OLLAMA_BASE_URL=http://localhost:11434` in your .env.

## GitHub Actions CI/CD

The `.github/workflows/ci.yml` pipeline runs automatically on:
- Every push to `develop` → runs tests
- Every push to `main` → runs tests + build + deploy notification

No additional setup needed — it uses GitHub's free Action minutes.
