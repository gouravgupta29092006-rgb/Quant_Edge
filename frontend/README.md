# QuantEdge Frontend

> Next.js 14 App Router frontend for the QuantEdge financial paper trading platform.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios with JWT auto-refresh interceptor
- **Charts:** Recharts
- **Real-time:** STOMP over WebSocket

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | JWT login |
| `/register` | User registration |
| `/dashboard` | Portfolio overview + market widgets |
| `/market` | Market overview, stock search, quotes |
| `/portfolio` | Portfolio holdings, trades, P&L |
| `/analytics` | Performance charts, Sharpe, drawdown |
| `/strategies` | Strategy builder and backtest results |
| `/news` | Financial news feed + sentiment |
| `/watchlist` | Stock watchlist management |
| `/settings` | User preferences |

## Getting Started

```bash
npm install
npm run dev
# App runs at http://localhost:3000
```

## Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## Project Structure

```
frontend/
  src/
    app/                  # Next.js App Router pages
      (auth)/             # Login, register pages
      (dashboard)/        # Protected app pages
    components/           # Shared UI components
    store/                # Zustand state stores
    lib/
      api/                # Axios client + API helpers
    hooks/                # Custom React hooks
```

## Backend API

All API calls go to `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api/v1`).

JWT access token (15min) is stored in memory. Refresh token (30d) is in `localStorage`.
The Axios interceptor automatically refreshes expired tokens on 401 responses.