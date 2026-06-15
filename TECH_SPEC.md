# QuantEdge — Technical Specification

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Scope:** API Contract, Security Implementation, Validation Rules, Error Standards, Performance Contracts

---

## TABLE OF CONTENTS

1. [API Design Standards](#1-api-design-standards)
2. [Authentication API](#2-authentication-api)
3. [Portfolio API](#3-portfolio-api)
4. [Markets API](#4-markets-api)
5. [Analytics API](#5-analytics-api)
6. [Strategy & Backtest API](#6-strategy--backtest-api)
7. [News API](#7-news-api)
8. [AI API](#8-ai-api)
9. [Notifications API](#9-notifications-api)
10. [Admin API](#10-admin-api)
11. [WebSocket Events Spec](#11-websocket-events-spec)
12. [Security Implementation](#12-security-implementation)
13. [Rate Limiting Specification](#13-rate-limiting-specification)
14. [Input Validation Rules](#14-input-validation-rules)
15. [Error Response Standards](#15-error-response-standards)
16. [Caching Specification](#16-caching-specification)
17. [Background Job Specifications](#17-background-job-specifications)
18. [Analytics Calculation Specs](#18-analytics-calculation-specs)
19. [Backtest Engine Spec](#19-backtest-engine-spec)

---

## 1. API DESIGN STANDARDS

### 1.1 Base Configuration

```
Base URL (development):   http://localhost:8080/api/v1
Base URL (production):    https://api.quantedge.app/api/v1
Content-Type:             application/json
Authentication:           Bearer {JWT_ACCESS_TOKEN} in Authorization header
API Version Header:       X-API-Version: 1
```

### 1.2 Response Envelope — ALL responses follow this shape

```typescript
// SUCCESS RESPONSE
{
  "success": true,
  "data": { ... },           // Always present on success
  "meta": {                  // Optional — pagination, rate limit info
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  },
  "timestamp": "2026-06-13T10:30:00.000Z"
}

// ERROR RESPONSE
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",         // Machine-readable code
    "message": "Validation failed",     // Human-readable summary
    "details": [                        // Optional — field-level errors
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "notanemail"
      }
    ]
  },
  "timestamp": "2026-06-13T10:30:00.000Z"
}
```

### 1.3 HTTP Status Codes Used

| Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (new resource) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure, malformed request |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (email taken, etc.) |
| 422 | Unprocessable Entity | Business logic failure (insufficient funds) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | External API failure |
| 503 | Service Unavailable | Circuit breaker open |

### 1.4 Pagination Standard

```
Query params:  ?page=1&limit=25&sortBy=created_at&sortOrder=desc
Default:       page=1, limit=25
Max limit:     100

Response meta:
{
  "meta": {
    "page": 2,
    "limit": 25,
    "total": 142,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### 1.5 Middleware Stack (Order Matters)

```typescript
// Applied to every route in this order:
app.use(helmet())                    // 1. Security headers
app.use(cors(corsConfig))            // 2. CORS
app.use(compression())               // 3. Gzip
app.use(morgan('combined'))          // 4. HTTP logging
app.use(express.json({ limit: '1mb' })) // 5. Body parser (size limit)
app.use(hpp())                       // 6. HTTP param pollution protection
app.use(globalRateLimit)             // 7. Global IP rate limit
app.use(sanitizeInputs)              // 8. Strip dangerous chars
// ... route-specific middleware per endpoint
```

---

## 2. AUTHENTICATION API

### POST /auth/register

```typescript
// Request Body (Zod Schema)
const registerSchema = z.object({
  email:        z.string().email().max(255).toLowerCase().trim(),
  password:     z.string()
                  .min(8)
                  .max(128)
                  .regex(/[A-Z]/, 'Must contain uppercase')
                  .regex(/[0-9]/, 'Must contain number')
                  .regex(/[^A-Za-z0-9]/, 'Must contain special char'),
  confirmPassword: z.string(),
  firstName:    z.string().min(1).max(50).trim(),
  lastName:     z.string().min(1).max(50).trim(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Rate limit: 5 registrations per IP per hour

// Process:
// 1. Validate schema
// 2. Check email uniqueness
// 3. Hash password (bcrypt, rounds=12)
// 4. Create user (status: PENDING_VERIFICATION)
// 5. Create user_preferences record
// 6. Generate email verification token (crypto.randomBytes(32))
// 7. Hash token → store in verification_tokens
// 8. Send verification email via Resend
// 9. Write audit log: AUTH_REGISTER
// 10. Return 201

// Response 201
{
  "success": true,
  "data": {
    "message": "Registration successful. Please check your email to verify your account.",
    "email": "user@example.com"
  }
}

// Error 409: Email already registered
// Error 400: Validation failure
```

### POST /auth/login

```typescript
const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(128),
  remember: z.boolean().optional().default(false),
});

// Rate limit: 10 attempts per IP per 15 minutes (authRateLimit)

// Process:
// 1. Validate schema
// 2. Find user by email
// 3. Check account not locked (locked_until > now())
// 4. Check status === ACTIVE (not SUSPENDED or PENDING_VERIFICATION)
// 5. Compare password (bcrypt.compare)
// 6. On failure: increment failed_login_count
//    If count >= 5: set locked_until = now() + 15min, reset count
// 7. On success: reset failed_login_count to 0
// 8. If 2FA enabled: generate interim token, return 2fa_required
// 9. If no 2FA: generate access + refresh tokens
// 10. Store refresh token hash in DB
// 11. Set httpOnly, Secure, SameSite=Strict cookie for refresh token
// 12. Update last_login_at, last_login_ip
// 13. Write audit log: AUTH_LOGIN

// Response 200 (no 2FA)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "avatarUrl": null,
      "twoFactorEnabled": false
    },
    "expiresIn": 900
  }
}

// Response 200 (2FA required)
{
  "success": true,
  "data": {
    "requiresTwoFactor": true,
    "interimToken": "temp_xxx",   // Short-lived, used for /auth/verify-2fa only
    "message": "Enter your 2FA code to continue"
  }
}

// Error 401: Invalid credentials
// Error 401: Account locked (includes lockedUntil timestamp)
// Error 403: Email not verified (includes resend option)
// Error 403: Account suspended
```

### POST /auth/verify-2fa

```typescript
const verify2faSchema = z.object({
  code:         z.string().length(6).regex(/^\d{6}$/),
  interimToken: z.string().min(1),
});

// Process:
// 1. Validate interim token (short TTL: 5 minutes)
// 2. Get user from interim token
// 3. Verify TOTP code (speakeasy, 30s window, ±1 window tolerance)
// 4. On failure: increment 2FA failure count (3 max → back to login)
// 5. On success: generate full auth tokens (same as login success)

// Response: same as login success
```

### POST /auth/refresh

```typescript
// No body — reads refresh token from httpOnly cookie

// Process:
// 1. Extract refresh token from cookie
// 2. Hash token → lookup in refresh_tokens table
// 3. Verify not expired
// 4. Verify user is still ACTIVE
// 5. Generate new access token
// 6. Rotate refresh token (delete old, create new — store new in cookie)
// 7. Update last_used on token record

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 900
  }
}

// Error 401: Invalid or expired refresh token → client must re-login
```

### POST /auth/logout

```typescript
// Auth: Required (Bearer token)
// No body — reads refresh token from cookie

// Process:
// 1. Delete refresh token from DB (by hash)
// 2. Clear refresh token cookie
// 3. Write audit log: AUTH_LOGOUT

// Response 204 (No Content)
```

### POST /auth/forgot-password

```typescript
const forgotSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

// Rate limit: 3 requests per email per hour

// Process:
// 1. Find user by email (never reveal if exists or not)
// 2. If exists: generate reset token, hash, store, send email
// 3. Always return same response (prevent email enumeration)

// Response 200 — Always the same regardless of whether email exists
{
  "success": true,
  "data": {
    "message": "If that email address is registered, a password reset link has been sent."
  }
}
```

### POST /auth/reset-password

```typescript
const resetSchema = z.object({
  token:           z.string().min(32).max(128),
  newPassword:     z.string().min(8).max(128)
                    .regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword);

// Process:
// 1. Hash token → find in verification_tokens (type=password_reset)
// 2. Check not expired (expires_at > now())
// 3. Check not already used (used_at is null)
// 4. Hash new password
// 5. Update user.password_hash
// 6. Mark token as used (used_at = now())
// 7. Invalidate ALL refresh tokens for user (force re-login all devices)
// 8. Write audit log: AUTH_PASSWORD_RESET
```

### POST /auth/setup-2fa

```typescript
// Auth: Required
// Step 1: Generate secret
// Returns QR code URL + backup codes

// Response 200
{
  "success": true,
  "data": {
    "secret": "BASE32SECRET",
    "qrCodeUrl": "data:image/png;base64,...",
    "backupCodes": ["xxxx-xxxx", "xxxx-xxxx", ...], // 10 codes
    "message": "Scan the QR code with your authenticator app, then verify with a code to enable 2FA"
  }
}
```

### POST /auth/enable-2fa

```typescript
const enable2faSchema = z.object({
  code:   z.string().length(6).regex(/^\d{6}$/),
  secret: z.string().min(16), // The secret from setup step
});

// Process:
// 1. Verify TOTP code against provided secret
// 2. Encrypt secret → store in user.two_factor_secret
// 3. Hash backup codes → store in user.two_factor_backup
// 4. Set user.two_factor_enabled = true
// 5. Write audit log: AUTH_2FA_ENABLE
```

### GET /auth/sessions

```typescript
// Auth: Required
// Returns all active sessions for current user

// Response 200
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "deviceInfo": "Chrome 124 on macOS",
        "ipAddress": "192.168.1.1",
        "lastUsed": "2026-06-13T08:00:00Z",
        "isCurrent": true
      }
    ]
  }
}
```

### DELETE /auth/sessions/:sessionId

```typescript
// Auth: Required
// Revoke a specific session (refresh token)
// Cannot revoke current session (use /auth/logout for that)

// Response 204
```

---

## 3. PORTFOLIO API

### GET /portfolios

```typescript
// Auth: Required
// Returns all portfolios for authenticated user

// Response 200
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": "uuid",
        "name": "My Portfolio",
        "cashBalance": 12450.00,
        "totalValue": 124580.42,        // cash + holdings value
        "holdingsValue": 112130.42,
        "totalReturn": 24580.42,
        "totalReturnPercent": 24.58,
        "dailyChange": 1247.82,
        "dailyChangePercent": 1.01,
        "holdingsCount": 8,
        "isDefault": true,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /portfolios

```typescript
const createPortfolioSchema = z.object({
  name:           z.string().min(1).max(100).trim(),
  description:    z.string().max(500).optional(),
  initialCash:    z.number().min(1000).max(10000000).default(100000),
});

// Business rules:
// Max 5 portfolios per user
// First portfolio auto-set as default

// Response 201
{
  "success": true,
  "data": {
    "portfolio": { ...portfolioObject }
  }
}

// Error 422: Portfolio limit reached (max 5)
```

### GET /portfolios/:portfolioId

```typescript
// Auth: Required + owner check
// Detailed portfolio with holdings and current prices

// Response 200
{
  "success": true,
  "data": {
    "portfolio": {
      "id": "uuid",
      "name": "My Portfolio",
      "cashBalance": 12450.00,
      "totalValue": 124580.42,
      "holdings": [
        {
          "symbol": "AAPL",
          "companyName": "Apple Inc.",
          "shares": 50,
          "averageCost": 155.20,
          "currentPrice": 192.40,       // From Redis cache
          "currentValue": 9620.00,
          "unrealizedPnl": 1860.00,
          "unrealizedPnlPercent": 23.97,
          "dayChange": 62.00,
          "dayChangePercent": 0.65,
          "portfolioWeight": 7.72,
          "sector": "Technology"
        }
      ],
      "summary": {
        "totalReturn": 24580.42,
        "totalReturnPercent": 24.58,
        "dailyChange": 1247.82,
        "dailyChangePercent": 1.01
      }
    }
  }
}
```

### GET /portfolios/:portfolioId/chart

```typescript
// Query: ?range=1D|1W|1M|3M|6M|1Y|ALL&benchmark=SPY|QQQ|DIA
// Returns time-series for chart

// Response 200
{
  "success": true,
  "data": {
    "portfolio": [
      { "date": "2026-01-01", "value": 100000 },
      { "date": "2026-01-02", "value": 101200 }
    ],
    "benchmark": [
      { "date": "2026-01-01", "value": 100000 },  // normalized to 100%
      { "date": "2026-01-02", "value": 100850 }
    ],
    "range": "6M",
    "benchmark": "SPY"
  }
}
```

### POST /portfolios/:portfolioId/trade

```typescript
const tradeSchema = z.object({
  symbol:     z.string().regex(/^[A-Z]{1,5}$/).toUpperCase(),
  type:       z.enum(['BUY', 'SELL']),
  orderType:  z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  shares:     z.number().positive().max(1000000)
                .refine(v => Number(v.toFixed(4)) === v, 'Max 4 decimal places'),
  limitPrice: z.number().positive().optional(),
});

// Process:
// 1. Validate schema
// 2. Verify portfolio ownership
// 3. Get current price from Redis (or live API if cache miss)
// 4. If LIMIT order: use limitPrice; if MARKET: use current price
// 5. BUY: Check cash balance >= shares * price
// 6. SELL: Check holding exists with sufficient shares
// 7. Execute:
//    - Create transaction record
//    - Update/create holding (recalculate average cost using FIFO)
//    - Deduct/credit cash balance
// 8. Write audit log: TRADE_BUY or TRADE_SELL
// 9. Emit portfolio:update via WebSocket

// Average cost calculation (BUY):
// newAvgCost = (existing_shares * existing_avg_cost + new_shares * price) 
//              / (existing_shares + new_shares)

// Response 201
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "BUY",
      "symbol": "AAPL",
      "shares": 10,
      "pricePerShare": 192.40,
      "totalAmount": 1924.00,
      "newCashBalance": 10526.00,
      "executedAt": "2026-06-13T10:30:00Z"
    }
  }
}

// Error 422: Insufficient cash (BUY)
// Error 422: Insufficient shares (SELL)
// Error 404: Invalid ticker symbol
```

### GET /portfolios/:portfolioId/transactions

```typescript
// Query: ?page=1&limit=25&type=BUY|SELL|ALL&from=2026-01-01&to=2026-06-13

// Response 200 (paginated)
{
  "success": true,
  "data": {
    "transactions": [ ...transactionObjects ]
  },
  "meta": { "page": 1, "limit": 25, "total": 89 }
}
```

### POST /portfolios/:portfolioId/cash

```typescript
const cashSchema = z.object({
  type:   z.enum(['DEPOSIT', 'WITHDRAWAL']),
  amount: z.number().positive().max(10000000),
});

// Withdrawal: cannot reduce cash below $0
// Max cash balance: $10,000,000

// Response 200
{
  "success": true,
  "data": {
    "newBalance": 25000.00,
    "transaction": { ...transactionObject }
  }
}
```

---

## 4. MARKETS API

### GET /markets/overview

```typescript
// No auth required (public)
// Cached in Redis: 15 seconds

// Response 200
{
  "success": true,
  "data": {
    "indices": [
      {
        "symbol": "SPY",
        "name": "S&P 500",
        "price": 5432.10,
        "change": 24.50,
        "changePercent": 0.45,
        "isOpen": true
      }
    ],
    "marketStatus": {
      "isOpen": true,
      "nextEvent": "Market closes at 4:00 PM ET",
      "timezone": "America/New_York"
    }
  }
}
```

### GET /markets/stocks/search

```typescript
// Query: ?q={query}&limit=10
// Debounce at client: 300ms
// Rate limit: 5 req/second per user

// Process:
// 1. Strip non-alphanumeric except spaces
// 2. Search stocks table: symbol ILIKE or name trigram match
// 3. Prioritize exact symbol match, then starts-with, then contains

// Response 200
{
  "success": true,
  "data": {
    "results": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "sector": "Technology",
        "currentPrice": 192.40,
        "changePercent": 0.65
      }
    ]
  }
}
```

### GET /markets/stocks/:symbol

```typescript
// Combines quote + statistics
// Cache: 15 seconds for price, 1 hour for stats

// Response 200
{
  "success": true,
  "data": {
    "stock": {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "sector": "Technology",
      "price": 192.40,
      "open": 190.80,
      "high": 193.20,
      "low": 190.20,
      "prevClose": 191.16,
      "change": 1.24,
      "changePercent": 0.65,
      "volume": 52847291,
      "avgVolume": 58000000,
      "marketCap": 2940000000000,
      "peRatio": 31.2,
      "eps": 6.17,
      "beta": 1.24,
      "dividendYield": 0.51,
      "week52High": 220.20,
      "week52Low": 164.08,
      "sharesOutstanding": 15287600000
    },
    "isInWatchlist": false,
    "userHolding": null    // or { shares, averageCost, unrealizedPnl }
  }
}
```

### GET /markets/stocks/:symbol/chart

```typescript
// Query: ?range=1D|1W|1M|3M|6M|1Y|5Y&type=candlestick|line

// Returns OHLCV array for TradingView
// Cache: 15s (1D), 1h (historical)

// Response 200
{
  "success": true,
  "data": {
    "candles": [
      {
        "time": 1700000000,   // Unix timestamp
        "open": 190.20,
        "high": 192.80,
        "low": 189.90,
        "close": 192.40,
        "volume": 52847291
      }
    ],
    "range": "1M",
    "interval": "1day"
  }
}
```

### GET /markets/movers

```typescript
// Query: ?type=gainers|losers|active&limit=20
// Cache: 60 seconds

// Response 200
{
  "success": true,
  "data": {
    "type": "gainers",
    "stocks": [
      {
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "price": 892.40,
        "change": 68.20,
        "changePercent": 8.27,
        "volume": 45200000
      }
    ]
  }
}
```

### GET /markets/sectors

```typescript
// Sector performance
// Cache: 5 minutes

// Response 200
{
  "success": true,
  "data": {
    "sectors": [
      {
        "name": "Technology",
        "changePercent": 1.24,
        "topGainer": { "symbol": "NVDA", "changePercent": 8.27 },
        "topLoser":  { "symbol": "INTC", "changePercent": -2.10 }
      }
    ]
  }
}
```

### GET /markets/calendar/earnings

```typescript
// Query: ?from=2026-06-13&to=2026-06-20
// Cache: 4 hours

// Response 200
{
  "success": true,
  "data": {
    "events": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "date": "2026-07-25",
        "time": "after_close",    // before_open | after_close | during_market
        "estimatedEps": 1.35,
        "previousEps": 1.29
      }
    ]
  }
}
```

### GET /markets/watchlist

```typescript
// Auth: Required
// Get user's watchlist with live prices

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "price": 192.40,
        "changePercent": 0.65,
        "sparkline": [191.2, 191.8, 192.1, 191.9, 192.4], // 7-day closes
        "addedAt": "2026-05-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /markets/watchlist

```typescript
const watchlistSchema = z.object({
  symbol: z.string().regex(/^[A-Z]{1,5}$/).toUpperCase(),
});

// Max 50 items in watchlist
// Response 201
```

### DELETE /markets/watchlist/:symbol

```typescript
// Auth: Required
// Response 204
```

---

## 5. ANALYTICS API

### GET /analytics/:portfolioId

```typescript
// Query: ?period=1M|3M|6M|1Y|ALL&benchmark=SPY|QQQ|DIA
// Auth: Required + owner check
// Heavy computation — check Redis cache first (TTL: 5 minutes)

// Response 200
{
  "success": true,
  "data": {
    "portfolioId": "uuid",
    "period": "1Y",
    "benchmark": "SPY",
    "computed_at": "2026-06-13T10:30:00Z",
    "performance": {
      "totalReturn": 0.2458,           // 24.58%
      "annualizedReturn": 0.2458,
      "benchmarkReturn": 0.2150,
      "alpha": 0.0308,
      "beta": 1.12,
      "bestMonth": { "month": "2025-11", "return": 0.0842 },
      "worstMonth": { "month": "2025-08", "return": -0.0521 }
    },
    "risk": {
      "volatility": 0.1845,             // Annualized
      "sharpeRatio": 1.24,
      "sortinoRatio": 1.87,
      "maxDrawdown": -0.1240,
      "maxDrawdownStart": "2025-08-01",
      "maxDrawdownEnd": "2025-09-15",
      "valueAtRisk95": -2847.20,
      "valueAtRisk99": -4210.50,
      "calmarRatio": 1.98,
      "informationRatio": 0.42
    },
    "allocation": {
      "diversificationScore": 72,
      "concentrationRisk": "MODERATE",
      "sectors": [
        { "name": "Technology", "weight": 0.42 },
        { "name": "Financials", "weight": 0.18 }
      ],
      "correlationMatrix": [
        { "symbol1": "AAPL", "symbol2": "MSFT", "correlation": 0.78 }
      ]
    },
    "monthlyReturns": [
      { "year": 2026, "month": 1, "return": 0.0342 }
    ]
  }
}
```

### POST /analytics/:portfolioId/export

```typescript
// Generates PDF report
// Queued as background job (BullMQ)

// Response 202 (Accepted — processing)
{
  "success": true,
  "data": {
    "jobId": "export_uuid",
    "message": "Your report is being generated. You will receive a notification when ready.",
    "estimatedTime": "30 seconds"
  }
}
// → When done: notification + presigned S3 URL for download
```

---

## 6. STRATEGY & BACKTEST API

### GET /strategies

```typescript
// Auth: Required
// Query: ?status=DRAFT|ACTIVE|ARCHIVED&page=1&limit=25

// Response 200
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "uuid",
        "name": "SMA Crossover",
        "tags": ["trend", "moving-average"],
        "status": "ACTIVE",
        "indicators": ["SMA(20)", "SMA(50)"],
        "aiConfidence": 72.4,
        "backtestCount": 3,
        "lastBacktestReturn": 1.248,
        "createdAt": "2026-01-15T00:00:00Z"
      }
    ]
  }
}
```

### POST /strategies

```typescript
const strategyRuleSchema = z.object({
  indicator:  z.string().max(50),
  params:     z.record(z.number()),
  condition:  z.enum(['CROSSES_ABOVE', 'CROSSES_BELOW', 'IS_ABOVE', 'IS_BELOW', 'EQUALS']),
  compareTo:  z.union([z.number(), z.string()]), // number or another indicator name
});

const createStrategySchema = z.object({
  name:             z.string().min(1).max(100).trim(),
  description:      z.string().max(1000).optional(),
  tags:             z.array(z.string().max(30)).max(10).default([]),
  entryConditions:  z.array(strategyRuleSchema).min(1).max(10),
  exitConditions:   z.array(strategyRuleSchema).min(1).max(10),
  entryLogic:       z.enum(['AND', 'OR']).default('AND'),
  exitLogic:        z.enum(['AND', 'OR']).default('OR'),
  positionSizing:   z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_SHARES']).default('PERCENTAGE'),
  positionValue:    z.number().positive().default(100),
  stopLossPct:      z.number().min(0.1).max(50).optional(),
  takeProfitPct:    z.number().min(0.1).max(500).optional(),
});

// Response 201
```

### POST /strategies/:id/analyze

```typescript
// AI confidence analysis of strategy viability
// Auth: Required + owner check
// Rate limited to AI tier

// POST body: {} (empty — uses saved strategy rules)

// Response 200 (streaming SSE)
// Stream: AI assessment text
// Final: { confidence: 72.4, marketConditions: ['trending'], warnings: [...] }
```

### POST /backtests/run

```typescript
const backtestConfigSchema = z.object({
  strategyId:     z.string().uuid(),
  symbol:         z.string().regex(/^[A-Z]{1,5}$/).toUpperCase(),
  startDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  initialCapital: z.number().min(1000).max(10000000).default(10000),
  commission:     z.number().min(0).max(100).default(0),
  positionSizing: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_SHARES']).default('PERCENTAGE'),
  positionValue:  z.number().positive().default(100),
}).refine(d => new Date(d.startDate) < new Date(d.endDate), {
  message: 'startDate must be before endDate',
}).refine(d => {
  const start = new Date(d.startDate);
  const end = new Date(d.endDate);
  const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears <= 10;
}, 'Date range cannot exceed 10 years');

// Process:
// 1. Create backtest record (status: QUEUED)
// 2. Add to BullMQ backtest queue
// 3. Return immediately with backtest ID
// Progress updates via WebSocket: 'backtest:progress' events

// Response 202
{
  "success": true,
  "data": {
    "backtestId": "uuid",
    "status": "QUEUED",
    "message": "Backtest queued. Connect to WebSocket for progress updates."
  }
}
```

### GET /backtests/:backtestId

```typescript
// Auth: Required + owner check
// Returns full backtest results

// Response 200
{
  "success": true,
  "data": {
    "backtest": {
      "id": "uuid",
      "status": "COMPLETED",
      "symbol": "AAPL",
      "startDate": "2019-01-01",
      "endDate": "2024-12-31",
      "initialCapital": 10000,
      "results": {
        "totalReturnPct": 1.248,
        "annualizedReturn": 0.176,
        "sharpeRatio": 1.24,
        "sortinoRatio": 1.76,
        "maxDrawdownPct": -0.182,
        "volatility": 0.142,
        "winRate": 0.582,
        "totalTrades": 142,
        "profitableTrades": 83,
        "losingTrades": 59,
        "avgProfitPct": 0.0412,
        "avgLossPct": -0.0218,
        "profitFactor": 1.89,
        "benchmarkReturn": 0.906,
        "alpha": 0.342,
        "beta": 0.98,
        "calmarRatio": 0.967
      },
      "equityCurve": [
        { "date": "2019-01-01", "value": 10000, "benchmark": 10000 }
      ],
      "monthlyReturns": [
        { "year": 2019, "month": 1, "return": 0.0521 }
      ],
      "tradeLog": [
        {
          "entryDate": "2019-01-15",
          "exitDate": "2019-02-10",
          "entryPrice": 152.40,
          "exitPrice": 168.20,
          "shares": 65,
          "pnl": 1027.00,
          "pnlPercent": 0.1036,
          "exitReason": "SIGNAL"
        }
      ],
      "aiInterpretation": "Your SMA Crossover strategy...",
      "completedAt": "2026-06-13T10:35:00Z"
    }
  }
}
```

---

## 7. NEWS API

### GET /news/market

```typescript
// Query: ?page=1&limit=20&category=all|stocks|economy|earnings|fed|tech
// Cache: 15 minutes (Redis)
// No auth required

// Response 200
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "source": "Reuters",
        "headline": "Fed signals rate cut...",
        "excerpt": "The Federal Reserve...",
        "imageUrl": "https://...",
        "publishedAt": "2026-06-13T08:00:00Z",
        "category": "economy",
        "tickers": ["SPY", "TLT"],
        "summary": {
          "text": "AI-generated summary...",
          "sentiment": "BULLISH",
          "sentimentScore": 0.65
        },
        "url": "https://reuters.com/..."
      }
    ]
  },
  "meta": { "page": 1, "limit": 20, "total": 340 }
}
```

### GET /news/stock/:symbol

```typescript
// Stock-specific news (last 7 days, max 30)
// Cache: 15 minutes
```

### GET /news/personalized

```typescript
// Auth: Required
// News based on user's holdings + watchlist
```

### GET /news/brief/today

```typescript
// Daily AI market brief
// Cache: until midnight ET
// Returns latest brief or null if market not yet open

// Response 200
{
  "success": true,
  "data": {
    "brief": {
      "date": "2026-06-13",
      "content": "...",
      "sentiment": "NEUTRAL",
      "sections": {
        "premarket": "...",
        "recap": "...",
        "events": "...",
        "stories": "...",
        "take": "..."
      },
      "generatedAt": "2026-06-13T13:05:00Z"
    }
  }
}
```

---

## 8. AI API

### POST /ai/portfolio/analyze

```typescript
// Auth: Required
// Rate limited: AI tier (20/hr, 100/day)
// Streaming SSE response

const portfolioAnalyzeSchema = z.object({
  portfolioId:  z.string().uuid(),
  analysisType: z.enum(['full', 'risk', 'performance', 'rebalance']).default('full'),
});

// Process:
// 1. Check AI rate limit (Redis counter)
// 2. Load portfolio with holdings + prices
// 3. Compute analytics snapshot
// 4. Build context hash (SHA-256)
// 5. Check Redis cache for this hash
// 6. Cache hit: stream cached response
// 7. Cache miss: call Claude API (streaming)
// 8. Stream to client via SSE
// 9. On complete: cache full response + log AI interaction

// SSE stream format:
data: {"type":"status","message":"Analyzing your portfolio..."}
data: {"type":"token","content":"Your portfolio "}
data: {"type":"token","content":"shows moderate "}
data: {"type":"done","tokensUsed":847}
```

### POST /ai/strategy/parse

```typescript
// Auth: Required
// Convert natural language to strategy rules

const strategyParseSchema = z.object({
  description: z.string().min(10).max(2000).trim(),
});

// System prompt instructs Claude to return valid StrategyRule[] JSON
// Response is JSON (not streaming)

// Response 200
{
  "success": true,
  "data": {
    "parsed": {
      "entryConditions": [...],
      "exitConditions": [...],
      "indicators": [...],
      "positionSizing": "PERCENTAGE",
      "positionValue": 100
    },
    "explanation": "I interpreted your description as...",
    "confidence": 85
  }
}
```

### POST /ai/research

```typescript
// Auth: Required
// Market research query — streaming SSE

const researchSchema = z.object({
  query:   z.string().min(5).max(500).trim(),
  context: z.enum(['general', 'stock', 'sector', 'macro']).default('general'),
  symbol:  z.string().optional(),
});
```

### POST /ai/tutor

```typescript
// Auth: Required
// Explain financial concepts — streaming SSE

const tutorSchema = z.object({
  concept: z.string().min(2).max(200).trim(),
  level:   z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});
```

### POST /ai/backtest/interpret

```typescript
// Auth: Required
// Interpret backtest results — streaming SSE

const interpretSchema = z.object({
  backtestId: z.string().uuid(),
});
```

### POST /ai/chat

```typescript
// Auth: Required
// Free-form conversation — streaming SSE
// Conversation history kept in client, sent each turn

const chatSchema = z.object({
  message:  z.string().min(1).max(2000).trim(),
  history:  z.array(z.object({
    role:    z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(20),  // Max 20 turns of history
});
```

### GET /ai/usage

```typescript
// Auth: Required
// Returns user's AI usage for today

// Response 200
{
  "success": true,
  "data": {
    "callsToday": 47,
    "dailyLimit": 100,
    "callsThisHour": 3,
    "hourlyLimit": 20,
    "resetsAt": "2026-06-14T00:00:00Z",
    "hourlyResetsAt": "2026-06-13T11:00:00Z"
  }
}
```

---

## 9. NOTIFICATIONS API

### GET /notifications

```typescript
// Auth: Required
// Query: ?page=1&limit=25&type=all|alerts|portfolio|system&status=unread|all

// Response 200
{
  "success": true,
  "data": {
    "notifications": [ ...notificationObjects ],
    "unreadCount": 7
  }
}
```

### PATCH /notifications/:id/read

```typescript
// Mark single notification as read
// Response 200 { data: { notification: { ...updated } } }
```

### PATCH /notifications/read-all

```typescript
// Mark all notifications as read
// Response 200 { data: { updated: 7 } }
```

### DELETE /notifications/:id

```typescript
// Response 204
```

### GET /notifications/alerts

```typescript
// Get user's price alerts
// Response 200 { data: { alerts: [...] } }
```

### POST /notifications/alerts

```typescript
const alertSchema = z.object({
  symbol:    z.string().regex(/^[A-Z]{1,5}$/).toUpperCase(),
  condition: z.enum(['ABOVE', 'BELOW', 'PERCENT_CHANGE_UP', 'PERCENT_CHANGE_DOWN']),
  threshold: z.number().positive(),
  notes:     z.string().max(200).optional(),
});

// Max 20 price alerts per user
// Response 201
```

### DELETE /notifications/alerts/:alertId

```typescript
// Response 204
```

---

## 10. ADMIN API

### GET /admin/users

```typescript
// Auth: Required + ADMIN role
// Query: ?page=1&limit=25&search=email&role=USER|ADMIN&status=ACTIVE|SUSPENDED

// Response 200
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "USER",
        "status": "ACTIVE",
        "portfolioCount": 2,
        "aiCallsToday": 47,
        "lastLoginAt": "2026-06-13T08:00:00Z",
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ]
  }
}
```

### PATCH /admin/users/:userId

```typescript
const adminUpdateUserSchema = z.object({
  role:   z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  reason: z.string().max(500).optional(),  // Required for suspension
});

// Writes audit log: ADMIN_USER_SUSPEND or ADMIN_ROLE_CHANGE
```

### GET /admin/system/health

```typescript
// Detailed system health for admin
// Response 200 — detailed health breakdown (see TECH_STACK.md section 12.3)
```

### GET /admin/ai/usage

```typescript
// Query: ?from=2026-06-01&to=2026-06-13
// Aggregate AI usage stats for admin

// Response 200
{
  "success": true,
  "data": {
    "period": { "from": "2026-06-01", "to": "2026-06-13" },
    "totals": {
      "calls": 24821,
      "tokens": 18450000,
      "estimatedCostUsd": 55.35,
      "cachedCalls": 8240,
      "cacheHitRate": 0.332
    },
    "byFeature": [
      { "feature": "portfolio_analysis", "calls": 8420, "tokens": 6800000 }
    ],
    "topUsers": [
      { "userId": "uuid", "calls": 847, "tokens": 620000 }
    ],
    "dailyBreakdown": [
      { "date": "2026-06-13", "calls": 2140, "cost": 4.21 }
    ]
  }
}
```

### GET /admin/feature-flags

```typescript
// List all feature flags
```

### PATCH /admin/feature-flags/:key

```typescript
const featureFlagSchema = z.object({
  enabled:   z.boolean(),
  scope:     z.enum(['global', 'role', 'user']).optional(),
  targetIds: z.array(z.string()).optional(),
});
```

### GET /admin/audit-logs

```typescript
// Query: ?userId=&action=AUTH_LOGIN&from=&to=&page=1&limit=50
```

---

## 11. WEBSOCKET EVENTS SPEC

### 11.1 Connection & Authentication

```typescript
// Client connects with auth token
const socket = io(SOCKET_URL, {
  auth: { token: accessToken },
  transports: ['websocket'],
});

// Server authenticates on connect:
// 1. Verify JWT from auth.token
// 2. If invalid → emit 'auth:error', disconnect
// 3. If valid → join user-specific room: `user:${userId}`
```

### 11.2 Client → Server Events

```typescript
// Subscribe to stock price room
socket.emit('subscribe:price', { symbol: 'AAPL' });

// Unsubscribe from price room
socket.emit('unsubscribe:price', { symbol: 'AAPL' });

// Subscribe to portfolio updates
socket.emit('subscribe:portfolio', { portfolioId: 'uuid' });

// Subscribe to backtest progress
socket.emit('subscribe:backtest', { backtestId: 'uuid' });
```

### 11.3 Server → Client Events

```typescript
// Price update (emitted to subscribers of price room)
socket.on('price:update', (data: {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}) => { ... });

// Portfolio value update (after trade or price change)
socket.on('portfolio:update', (data: {
  portfolioId: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
}) => { ... });

// New notification
socket.on('notification:new', (data: {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string;
}) => { ... });

// Backtest progress update
socket.on('backtest:progress', (data: {
  backtestId: string;
  step: number;           // 1-5
  stepName: string;       // e.g., "Calculating Indicators"
  stepPercent: number;    // 0-100 for current step
  overallPercent: number; // 0-100 overall
}) => { ... });

// Backtest complete
socket.on('backtest:complete', (data: {
  backtestId: string;
  status: 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  totalReturnPct?: number;
}) => { ... });

// Price alert triggered
socket.on('alert:triggered', (data: {
  alertId: string;
  symbol: string;
  triggerPrice: number;
  condition: string;
  message: string;
}) => { ... });
```

---

## 12. SECURITY IMPLEMENTATION

### 12.1 JWT Configuration (RS256 Asymmetric)

```typescript
// Generate key pair (one-time, store in Secrets Manager)
// openssl genrsa -out private.pem 2048
// openssl rsa -in private.pem -pubout -out public.pem

// Access token payload
interface JwtPayload {
  sub: string;           // user ID
  email: string;
  role: UserRole;
  iat: number;           // issued at
  exp: number;           // expires (15 minutes)
  jti: string;           // unique token ID (for revocation if needed)
}

// Sign
const token = jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  expiresIn: '15m',
  issuer: 'quantedge.app',
  audience: 'quantedge-api',
});

// Verify
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],
  issuer: 'quantedge.app',
  audience: 'quantedge-api',
});
```

### 12.2 Middleware: authenticate

```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('UNAUTHORIZED', 'No token provided'));
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as JwtPayload;
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json(errorResponse('TOKEN_EXPIRED', 'Token has expired'));
    }
    return res.status(401).json(errorResponse('INVALID_TOKEN', 'Token is invalid'));
  }
};
```

### 12.3 Middleware: authorize (RBAC)

```typescript
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse('FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
};

// Usage: router.get('/admin/users', authenticate, authorize('ADMIN'), handler)
```

### 12.4 Middleware: validateRequest

```typescript
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        value: e.path.reduce((acc, k) => acc?.[k], req.body),
      }));
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors,
        },
      });
    }
    req.body = result.data;  // Replace with parsed + transformed data
    next();
  };
};
```

### 12.5 Middleware: sanitizeInputs

```typescript
import mongoSanitize from 'express-mongo-sanitize';

// Remove keys starting with $ or containing .
app.use(mongoSanitize());

// Additionally: strip dangerous HTML from string fields
export const sanitizeStrings = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
};

function deepSanitize(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deepSanitize(v)])
    );
  }
  return obj;
}
```

---

## 13. RATE LIMITING SPECIFICATION

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const redisStore = (prefix: string) => new RedisStore({
  client: redis,
  prefix: `rl:${prefix}:`,
});

// TIER 1: Global (all requests)
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 300,                   // 300 req / IP
  store: redisStore('global'),
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// TIER 2: Auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: redisStore('auth'),
  skipSuccessfulRequests: false,
});

// TIER 3: General API per user
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 60,
  store: redisStore('api'),
  keyGenerator: (req) => req.user?.id ?? req.ip,
});

// TIER 4: AI endpoints
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  store: redisStore('ai-hour'),
  keyGenerator: (req) => `${req.user?.id}:hour`,
});

// Check daily AI limit separately:
export const checkDailyAiLimit = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const today = new Date().toDateString();
  if (user.ai_calls_date?.toDateString() === today && user.ai_calls_today >= 100) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'AI_DAILY_LIMIT',
        message: 'Daily AI call limit reached (100/day)',
        resetsAt: new Date(new Date().setHours(24,0,0,0)).toISOString(),
      },
    });
  }
  next();
};

// TIER 5: Search
export const searchRateLimit = rateLimit({
  windowMs: 1000,   // 1 second
  max: 5,
  store: redisStore('search'),
  keyGenerator: (req) => req.user?.id ?? req.ip,
});

// TIER 6: Trade execution
export const tradeRateLimit = rateLimit({
  windowMs: 1000,   // 1 second
  max: 1,           // 1 trade per second absolute
  store: redisStore('trade'),
  keyGenerator: (req) => req.user?.id,
});
```

---

## 14. INPUT VALIDATION RULES

### 14.1 Financial Input Rules

```typescript
// Price values
z.number()
  .positive('Price must be positive')
  .max(999999.9999, 'Price exceeds maximum')
  .refine(v => /^\d+(\.\d{1,4})?$/.test(v.toString()), 'Max 4 decimal places')

// Share counts
z.number()
  .positive('Shares must be positive')
  .max(1000000, 'Cannot trade more than 1,000,000 shares')
  .refine(v => /^\d+(\.\d{1,4})?$/.test(v.toString()), 'Max 4 decimal places')

// Dollar amounts
z.number()
  .min(0.01, 'Minimum amount is $0.01')
  .max(10000000, 'Amount exceeds platform maximum')

// Ticker symbols
z.string()
  .regex(/^[A-Z]{1,5}$/, 'Invalid ticker symbol')
  .transform(s => s.toUpperCase())

// Date strings
z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
  .refine(s => !isNaN(Date.parse(s)), 'Invalid date')
  .refine(s => new Date(s) <= new Date(), 'Date cannot be in the future')

// Percentage
z.number()
  .min(0.01, 'Percentage must be positive')
  .max(100, 'Percentage cannot exceed 100')

// UUID
z.string().uuid('Invalid ID format')
```

### 14.2 User Input Rules

```typescript
// Email
z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim()

// Password
z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character')

// Name fields
z.string()
  .min(1, 'Required')
  .max(50, 'Too long')
  .regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, apostrophes allowed')
  .trim()

// TOTP code
z.string()
  .length(6, 'Must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Must be numeric only')

// Free text (portfolio names, strategy names)
z.string()
  .min(1, 'Required')
  .max(100, 'Too long')
  .regex(/^[a-zA-Z0-9\s\-_&().,']+$/, 'Invalid characters')
  .trim()

// Long text (descriptions, AI prompts)
z.string()
  .max(2000, 'Too long')
  .trim()

// Query strings (search)
z.string()
  .max(100, 'Search query too long')
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid search characters')
  .trim()
```

---

## 15. ERROR RESPONSE STANDARDS

### 15.1 Error Code Catalogue

```typescript
// Auth errors
'UNAUTHORIZED'          → 401  // No/invalid token
'TOKEN_EXPIRED'         → 401  // JWT expired
'INVALID_TOKEN'         → 401  // JWT malformed
'FORBIDDEN'             → 403  // Insufficient role
'EMAIL_NOT_VERIFIED'    → 403  // Account needs verification
'ACCOUNT_SUSPENDED'     → 403  // Admin-suspended
'ACCOUNT_LOCKED'        → 401  // Brute-force locked
'INVALID_CREDENTIALS'   → 401  // Wrong email/password
'INVALID_2FA_CODE'      → 401  // Wrong TOTP
'2FA_REQUIRED'          → 200  // Special — tells client to show 2FA

// Resource errors
'NOT_FOUND'             → 404  // Resource doesn't exist
'ALREADY_EXISTS'        → 409  // Duplicate (email, portfolio name)
'FORBIDDEN_RESOURCE'    → 403  // Valid auth but wrong owner

// Validation errors
'VALIDATION_ERROR'      → 400  // Zod schema failure
'INVALID_DATE_RANGE'    → 400  // Date logic error
'INVALID_SYMBOL'        → 404  // Ticker not found

// Business logic errors
'INSUFFICIENT_CASH'     → 422  // Not enough virtual cash
'INSUFFICIENT_SHARES'   → 422  // Not enough shares to sell
'PORTFOLIO_LIMIT'       → 422  // Max portfolios reached
'WATCHLIST_LIMIT'       → 422  // Max watchlist items
'ALERT_LIMIT'           → 422  // Max price alerts
'BACKTEST_TIMEOUT'      → 422  // Backtest exceeded time limit
'BACKTEST_RUNNING'      → 422  // Another backtest in progress

// Rate limit errors
'RATE_LIMIT'            → 429  // General rate limit
'AI_HOURLY_LIMIT'       → 429  // AI hourly limit
'AI_DAILY_LIMIT'        → 429  // AI daily limit

// External service errors
'MARKET_DATA_ERROR'     → 502  // Polygon/Finnhub failure
'AI_SERVICE_ERROR'      → 502  // Claude API failure
'EMAIL_SERVICE_ERROR'   → 502  // Resend failure

// System errors
'INTERNAL_ERROR'        → 500  // Unexpected error
'SERVICE_UNAVAILABLE'   → 503  // Circuit breaker open
```

### 15.2 Global Error Handler

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
      timestamp: new Date().toISOString(),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Resource already exists' },
      });
    }
  }

  // Never expose internal error details in production
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  });
};
```

---

## 16. CACHING SPECIFICATION

### 16.1 Cache-Aside Pattern (Standard)

```typescript
async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetchFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Usage example:
const quote = await getCachedOrFetch(
  `price:${symbol}`,
  15,
  () => polygonProvider.getQuote(symbol)
);
```

### 16.2 Cache Invalidation Rules

```typescript
// Invalidate on trade execution:
await redis.del(`portfolio:${portfolioId}:summary`);
await redis.del(`analytics:${portfolioId}:*`);  // wildcard pattern

// Invalidate price on manual refresh (admin):
await redis.del(`price:${symbol}`);

// Invalidate AI cache when portfolio changes significantly:
// (Only invalidate if holding change > 5% of portfolio weight)
const shouldInvalidate = holdingChangePercent > 0.05;
if (shouldInvalidate) {
  await redis.del(`ai:${contextHash}`);
}
```

### 16.3 Stale-While-Revalidate Pattern (for News)

```typescript
// Return stale data immediately, refresh in background
async function getNewsWithSWR(key: string) {
  const cached = await redis.get(key);
  const cachedAge = await redis.ttl(key);

  if (cached && cachedAge > 0) {
    // If older than 12 minutes (out of 15 TTL), refresh in background
    if (cachedAge < 180) {
      setImmediate(() => refreshNewsCache(key));  // Don't await
    }
    return JSON.parse(cached);
  }
  return await refreshNewsCache(key);
}
```

---

## 17. BACKGROUND JOB SPECIFICATIONS

### 17.1 Price Alert Checker

```typescript
// Runs every minute during market hours (9:30 AM – 4:00 PM ET, Mon-Fri)
// BullMQ worker: concurrency 1

async function checkPriceAlerts() {
  // 1. Get all active alert symbols (distinct)
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { status: 'ACTIVE' },
    distinct: ['symbol'],
  });

  // 2. For each symbol, get current price from Redis
  for (const { symbol } of activeAlerts) {
    const priceData = await redis.get(`price:${symbol}`);
    const currentPrice = JSON.parse(priceData ?? '{}').price;
    if (!currentPrice) continue;

    // 3. Check all alerts for this symbol
    const symbolAlerts = await prisma.priceAlert.findMany({
      where: { symbol, status: 'ACTIVE' },
    });

    for (const alert of symbolAlerts) {
      const triggered = evaluateAlert(alert, currentPrice);
      if (triggered) {
        await triggerAlert(alert, currentPrice);
      }
    }
  }
}

function evaluateAlert(alert: PriceAlert, currentPrice: number): boolean {
  switch (alert.condition) {
    case 'ABOVE': return currentPrice >= alert.threshold_value;
    case 'BELOW': return currentPrice <= alert.threshold_value;
    // PERCENT_CHANGE requires prev_close comparison
    default: return false;
  }
}

async function triggerAlert(alert: PriceAlert, triggerPrice: number) {
  // Lock to prevent duplicate triggers (5-minute dedup)
  const lockKey = `alert:triggered:${alert.id}`;
  const locked = await redis.set(lockKey, '1', 'EX', 300, 'NX');
  if (!locked) return;

  await prisma.priceAlert.update({
    where: { id: alert.id },
    data: { status: 'TRIGGERED', triggered_at: new Date(), triggered_price: triggerPrice },
  });

  await createNotification(alert.user_id, {
    type: 'PRICE_ALERT',
    title: `${alert.symbol} Alert Triggered`,
    message: `${alert.symbol} is now ${formatPrice(triggerPrice)} (condition: ${alert.condition} ${alert.threshold_value})`,
    data: { symbol: alert.symbol, alertId: alert.id },
    actionUrl: `/app/markets/stocks/${alert.symbol}`,
  });

  // Emit via WebSocket
  io.to(`user:${alert.user_id}`).emit('alert:triggered', { alertId: alert.id, symbol: alert.symbol, triggerPrice });
}
```

### 17.2 News Ingestion Job

```typescript
// Runs every 15 minutes (24/7)

async function ingestNews() {
  // Fetch from Finnhub
  const articles = await finnhubClient.getMarketNews('general');

  for (const article of articles) {
    // Dedup by external_id or URL
    const exists = await prisma.newsArticle.findFirst({
      where: { OR: [{ external_id: article.id }, { source_url: article.url }] },
    });
    if (exists) continue;

    // Create article
    const created = await prisma.newsArticle.create({ data: mapArticle(article) });

    // Queue AI summarization job (low priority)
    await aiJobsQueue.add('summarize-article', { articleId: created.id }, { priority: 10 });

    // Extract and link stock mentions
    const mentions = extractTickerMentions(article.headline + ' ' + article.excerpt);
    if (mentions.length > 0) {
      await prisma.newsStockMention.createMany({
        data: mentions.map(symbol => ({ article_id: created.id, symbol })),
        skipDuplicates: true,
      });
    }
  }
}
```

---

## 18. ANALYTICS CALCULATION SPECS

### 18.1 Portfolio Return

```typescript
// Total Return
totalReturn = (currentValue - initialCapital) / initialCapital;

// Annualized Return (CAGR)
const years = daysBetween(startDate, endDate) / 365.25;
cagr = Math.pow(1 + totalReturn, 1 / years) - 1;
```

### 18.2 Volatility (Annualized)

```typescript
// Input: array of daily return percentages
function annualizedVolatility(dailyReturns: number[]): number {
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0)
                   / (dailyReturns.length - 1);
  const dailyStdDev = Math.sqrt(variance);
  return dailyStdDev * Math.sqrt(252);  // 252 trading days
}
```

### 18.3 Sharpe Ratio

```typescript
// Sharpe = (Portfolio Return - Risk-Free Rate) / Portfolio Volatility
function sharpeRatio(annualReturn: number, volatility: number, riskFreeRate: number): number {
  if (volatility === 0) return 0;
  return (annualReturn - riskFreeRate) / volatility;
}
// Risk-free rate: US Fed Funds Rate from Alpha Vantage (cached 24h)
```

### 18.4 Sortino Ratio

```typescript
// Only uses DOWNSIDE deviation (negative returns only)
function sortinoRatio(dailyReturns: number[], annualReturn: number, riskFreeRate: number): number {
  const negativeReturns = dailyReturns.filter(r => r < 0);
  if (negativeReturns.length === 0) return Infinity;
  const downsideVariance = negativeReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  return (annualReturn - riskFreeRate) / downsideDeviation;
}
```

### 18.5 Maximum Drawdown

```typescript
function maxDrawdown(values: number[]): { drawdown: number; startIdx: number; endIdx: number } {
  let peak = values[0];
  let peakIdx = 0;
  let maxDD = 0;
  let maxDDStart = 0;
  let maxDDEnd = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
      peakIdx = i;
    }
    const drawdown = (values[i] - peak) / peak;
    if (drawdown < maxDD) {
      maxDD = drawdown;
      maxDDStart = peakIdx;
      maxDDEnd = i;
    }
  }
  return { drawdown: maxDD, startIdx: maxDDStart, endIdx: maxDDEnd };
}
```

### 18.6 Value at Risk (Parametric)

```typescript
// Parametric VaR = Portfolio Value × Z-score × Daily Volatility
// Z-score: 95% = 1.645, 99% = 2.326
function valueAtRisk(portfolioValue: number, dailyVolatility: number, confidence: 95 | 99): number {
  const zScore = confidence === 95 ? 1.645 : 2.326;
  return -portfolioValue * zScore * dailyVolatility;  // Negative = loss
}
```

---

## 19. BACKTEST ENGINE SPEC

```typescript
// Backtest execution flow (runs in Worker thread)

interface BacktestEngine {
  run(config: BacktestConfig): Promise<BacktestResults>;
}

async function runBacktest(config: BacktestConfig): Promise<BacktestResults> {
  // STEP 1: Load Historical Data (20%)
  emitProgress(1, 'Loading Historical Data', 0);
  const prices = await loadHistoricalPrices(config.symbol, config.startDate, config.endDate);
  emitProgress(1, 'Loading Historical Data', 100);

  // STEP 2: Calculate Indicators (40%)
  emitProgress(2, 'Calculating Indicators', 0);
  const indicators = calculateAllIndicators(prices, config.strategy.indicators);
  emitProgress(2, 'Calculating Indicators', 100);

  // STEP 3: Run Simulation (60%)
  emitProgress(3, 'Running Simulation', 0);
  const { trades, equityCurve } = simulateTrades(prices, indicators, config);
  emitProgress(3, 'Running Simulation', 100);

  // STEP 4: Evaluate Performance (80%)
  emitProgress(4, 'Evaluating Performance', 0);
  const metrics = calculateMetrics(equityCurve, trades, config);
  emitProgress(4, 'Evaluating Performance', 100);

  // STEP 5: Generate Report (100%)
  emitProgress(5, 'Generating Report', 0);
  const monthlyReturns = computeMonthlyReturns(equityCurve);
  const benchmark = await loadBenchmarkReturns('SPY', config.startDate, config.endDate);
  emitProgress(5, 'Generating Report', 100);

  return { metrics, equityCurve, trades, monthlyReturns, benchmark };
}

// Indicator calculations
function calculateSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    return closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  // Wilder smoothing...
  return computeWilderRSI(gains, losses, period);
}

// Signal evaluation
function evaluateEntrySignal(
  indicators: IndicatorValues,
  rules: StrategyRule[],
  logic: 'AND' | 'OR'
): boolean {
  const results = rules.map(rule => evaluateRule(indicators, rule));
  return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

// Position management
function simulateTrades(prices: OHLCV[], indicators: IndicatorValues, config: BacktestConfig) {
  let cash = config.initialCapital;
  let position = 0;       // Current shares held
  let entryPrice = 0;
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  for (let i = 0; i < prices.length; i++) {
    const { close } = prices[i];
    const currentValue = cash + position * close;
    equityCurve.push({ date: prices[i].timestamp, value: currentValue });

    const inPosition = position > 0;

    if (!inPosition && evaluateEntrySignal(indicators, config.strategy.entryConditions, 'AND', i)) {
      // BUY signal
      const tradeValue = config.positionSizing === 'PERCENTAGE'
        ? cash * (config.positionValue / 100)
        : config.positionValue;
      const shares = Math.floor(tradeValue / close);
      if (shares > 0) {
        const cost = shares * close + config.commission;
        cash -= cost;
        position = shares;
        entryPrice = close;
      }
    } else if (inPosition && evaluateExitSignal(indicators, config.strategy.exitConditions, i, close, entryPrice)) {
      // SELL signal
      const proceeds = position * close - config.commission;
      const pnl = proceeds - (position * entryPrice);
      trades.push({ entryDate: ..., exitDate: ..., entryPrice, exitPrice: close, shares: position, pnl });
      cash += proceeds;
      position = 0;
      entryPrice = 0;
    }
  }

  return { trades, equityCurve };
}
```

---

*End of QuantEdge Technical Specification v1.0.0*
*Next: See IMPLEMENTATION.md for step-by-step build guide*
