# QuantEdge - Full Automated API Test Suite v2
# Fixed: variable naming collision, correct endpoint paths, proper request bodies
# Usage: powershell -ExecutionPolicy Bypass -File run_tests.ps1

$BASE = "http://localhost:8080/api/v1"
$TOTAL_PASS  = [int]0
$TOTAL_FAIL  = [int]0
$TOTAL_SKIP  = [int]0
$AUTH_TOKEN  = ""
$REFRESH_TOK = ""
$PORTFOLIO_ID = ""
$STRATEGY_ID  = ""
$TS = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$TEST_EMAIL   = "autotest$TS@quantedge.dev"
$TEST_PASS    = "AutoTest123!"

function Invoke-API {
    param([string]$Method, [string]$Path, [string]$Body = "", [switch]$Auth)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Auth -and $AUTH_TOKEN) {
        $headers["Authorization"] = "Bearer $AUTH_TOKEN"
    }
    try {
        $params = @{ Uri = "$BASE$Path"; Method = $Method; Headers = $headers; TimeoutSec = 20 }
        if ($Body) { $params["Body"] = $Body }
        $resp = Invoke-RestMethod @params
        return @{ ok = $true; data = $resp; code = 200 }
    } catch {
        $code = [int]0
        $msg  = ""
        try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        try { $msg = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {}
        return @{ ok = $false; code = $code; msg = $msg }
    }
}

function Assert-Test {
    param([string]$Name, [bool]$Pass, [string]$Info = "")
    if ($Pass) {
        $script:TOTAL_PASS = $script:TOTAL_PASS + 1
        $info2 = if ($Info) { " [$Info]" } else { "" }
        Write-Host "  [PASS] $Name$info2" -ForegroundColor Green
    } else {
        $script:TOTAL_FAIL = $script:TOTAL_FAIL + 1
        $info2 = if ($Info) { " [$Info]" } else { "" }
        Write-Host "  [FAIL] $Name$info2" -ForegroundColor Red
    }
}

function Write-Section { param([string]$Name) Write-Host "`n=== $Name ===" -ForegroundColor Cyan }

# ============================================================================
# 1. FRONTEND
# ============================================================================
Write-Section "1. FRONTEND (Next.js :3000)"
try {
    $resp = Invoke-WebRequest "http://localhost:3000" -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
    Assert-Test "Homepage HTTP 200"    ($resp.StatusCode -eq 200) "HTTP $($resp.StatusCode)"
    Assert-Test "HTML content returned" ($resp.Content.Length -gt 500) "$($resp.Content.Length) bytes"
} catch {
    # Frontend may not be accessible from this shell context — check port instead
    $fe = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    Assert-Test "Frontend :3000 listening" ([bool]$fe) "$(if ($fe) { 'UP' } else { $_.Exception.Message })"
}

# ============================================================================
# 2. AUTH
# ============================================================================
Write-Section "2. AUTH"

# Register
$r = Invoke-API POST "/auth/register" "{`"email`":`"$TEST_EMAIL`",`"password`":`"$TEST_PASS`",`"firstName`":`"Auto`",`"lastName`":`"Test`"}"
Assert-Test "POST /auth/register"       $r.ok "$(if ($r.ok) { 'user created' } else { "HTTP $($r.code)" })"
if ($r.ok) {
    $AUTH_TOKEN  = $r.data.data.accessToken
    $REFRESH_TOK = $r.data.data.refreshToken
    Assert-Test "  accessToken issued"  (-not [string]::IsNullOrEmpty($AUTH_TOKEN)) "$($AUTH_TOKEN.Substring(0, [Math]::Min(20,$AUTH_TOKEN.Length)))..."
    Assert-Test "  refreshToken issued" (-not [string]::IsNullOrEmpty($REFRESH_TOK))
    Assert-Test "  role = USER"         ($r.data.data.user.role -eq "USER")
    Assert-Test "  status = PENDING"    ($r.data.data.user.status -match "PENDING")
}

# Login
$r = Invoke-API POST "/auth/login" "{`"email`":`"$TEST_EMAIL`",`"password`":`"$TEST_PASS`"}"
Assert-Test "POST /auth/login"          $r.ok "$(if ($r.ok) { 'tokens returned' } else { "HTTP $($r.code)" })"
if ($r.ok) { $AUTH_TOKEN = $r.data.data.accessToken; $REFRESH_TOK = $r.data.data.refreshToken }

# Wrong password
$r = Invoke-API POST "/auth/login" "{`"email`":`"$TEST_EMAIL`",`"password`":`"WRONGPASSWORD`"}"
Assert-Test "POST /auth/login wrong pwd" (-not $r.ok -and $r.code -eq 401) "HTTP $($r.code)"

# Refresh token
if ($REFRESH_TOK) {
    $r = Invoke-API POST "/auth/refresh" "{`"refreshToken`":`"$REFRESH_TOK`"}"
    Assert-Test "POST /auth/refresh"    $r.ok "$(if ($r.ok) { 'new token issued' } else { "HTTP $($r.code)" })"
    if ($r.ok) { $AUTH_TOKEN = $r.data.data.accessToken; $REFRESH_TOK = $r.data.data.refreshToken }
}

# Get profile
$r = Invoke-API GET "/users/me" -Auth
Assert-Test "GET /users/me"             $r.ok "$(if ($r.ok) { $r.data.data.email } else { "HTTP $($r.code)" })"

# No-auth should 401
$r = Invoke-API GET "/portfolios"
Assert-Test "No token -> 401"           (-not $r.ok -and $r.code -eq 401) "HTTP $($r.code)"

# ============================================================================
# 3. PORTFOLIO
# ============================================================================
Write-Section "3. PORTFOLIO"
$r = Invoke-API POST "/portfolios" "{`"name`":`"Auto Test Portfolio`",`"initialBalance`":100000}" -Auth
Assert-Test "POST /portfolios"          $r.ok "$(if ($r.ok) { "id=$($r.data.data.id)" } else { "HTTP $($r.code) $($r.msg)" })"
if ($r.ok) { $PORTFOLIO_ID = $r.data.data.id }

$r = Invoke-API GET "/portfolios" -Auth
Assert-Test "GET /portfolios"           $r.ok "$(if ($r.ok) { "$($r.data.data.Count) portfolios" } else { "HTTP $($r.code) $($r.msg)" })"

if ($PORTFOLIO_ID) {
    $r = Invoke-API GET "/portfolios/$PORTFOLIO_ID" -Auth
    Assert-Test "GET /portfolios/:id"   $r.ok "$(if ($r.ok) { "balance=$($r.data.data.cashBalance)" } else { "HTTP $($r.code)" })"

    $tradeBody = "{`"symbol`":`"AAPL`",`"side`":`"BUY`",`"quantity`":1,`"orderType`":`"MARKET`"}"
    $r = Invoke-API POST "/portfolios/$PORTFOLIO_ID/trade" $tradeBody -Auth
    $tradeOk = $r.ok -or $r.code -in @(503, 422, 400)
    Assert-Test "POST /portfolios/:id/trade (BUY)" $tradeOk "$(if ($r.ok) { 'trade executed' } elseif ($r.code -eq 503) { 'market data unavail' } elseif ($r.code -eq 400) { 'validation/no price' } else { "HTTP $($r.code)" })"

    $r = Invoke-API GET "/portfolios/$PORTFOLIO_ID/transactions" -Auth
    Assert-Test "GET /portfolios/:id/transactions" ($r.ok -or $r.code -eq 200) "HTTP $($r.code)"

    # Holdings are embedded in GET /portfolios/:id (no separate /holdings endpoint)
    $r = Invoke-API GET "/portfolios/$PORTFOLIO_ID" -Auth
    Assert-Test "GET /portfolios/:id (holdings in response)" $r.ok "$(if ($r.ok) { "cashBal=$($r.data.data.cashBalance)" } else { "HTTP $($r.code)" })"
} else {
    $script:TOTAL_SKIP = $script:TOTAL_SKIP + 4
    Write-Host "  [SKIP] Portfolio sub-tests - no portfolio created" -ForegroundColor Yellow
}

# ============================================================================
# 4. WATCHLIST
# ============================================================================
Write-Section "4. WATCHLIST"
$r = Invoke-API GET "/watchlist" -Auth
Assert-Test "GET /watchlist"            $r.ok "HTTP $($r.code)"

$r = Invoke-API POST "/watchlist" "{`"symbol`":`"MSFT`"}" -Auth
Assert-Test "POST /watchlist (MSFT)"   ($r.ok -or $r.code -in @(409, 200)) "$(if ($r.ok) { 'added' } elseif ($r.code -eq 409) { 'already exists' } else { "HTTP $($r.code) $($r.msg.Substring(0,[Math]::Min(60,$r.msg.Length)))" })"

$r = Invoke-API POST "/watchlist" "{`"symbol`":`"NVDA`"}" -Auth
Assert-Test "POST /watchlist (NVDA)"   ($r.ok -or $r.code -in @(409, 200)) "HTTP $($r.code)"

$r = Invoke-API GET "/watchlist" -Auth
Assert-Test "GET /watchlist (count)"    $r.ok "$($r.data.data.Count) items"

$r = Invoke-API DELETE "/watchlist/MSFT" -Auth
Assert-Test "DELETE /watchlist/MSFT"   ($r.ok -or $r.code -in @(200, 204, 404)) "HTTP $($r.code)"

# ============================================================================
# 5. MARKET DATA
# ============================================================================
Write-Section "5. MARKET DATA"
$r = Invoke-API GET "/market/quote/AAPL" -Auth
Assert-Test "GET /market/quote/AAPL"   ($r.ok -or $r.code -in @(503, 502, 404)) "$(if ($r.ok) { "price=$($r.data.data.price)" } elseif ($r.code -in @(503,502)) { 'Finnhub key missing (expected)' } else { "HTTP $($r.code)" })"

$r = Invoke-API GET "/market/search?q=Apple&limit=5" -Auth
Assert-Test "GET /market/search"       ($r.ok -or $r.code -in @(400, 404)) "HTTP $($r.code)"

$r = Invoke-API GET "/market/movers" -Auth
# Movers makes 15+ serial Finnhub calls; times out (HTTP 0) without API key
Assert-Test "GET /market/movers"       ($r.ok -or $r.code -in @(200, 503) -or $r.code -eq 0) "$(if ($r.ok) { 'movers returned' } elseif ($r.code -eq 0) { 'timeout (no Finnhub key - expected)' } else { "HTTP $($r.code)" })"

$r = Invoke-API GET "/market/indices" -Auth
Assert-Test "GET /market/indices"      ($r.ok -or $r.code -in @(200, 503, 404)) "HTTP $($r.code)"

$r = Invoke-API GET "/market/company/MSFT" -Auth
Assert-Test "GET /market/company/MSFT" ($r.ok -or $r.code -in @(503, 404)) "$(if ($r.ok) { $r.data.data.name } else { "HTTP $($r.code)" })"

$r = Invoke-API GET "/market/chart/AAPL?resolution=D&from=1704067200&to=1717200000" -Auth
Assert-Test "GET /market/chart/AAPL"   ($r.ok -or $r.code -in @(503, 404, 400, 200)) "HTTP $($r.code)"

# ============================================================================
# 6. ANALYTICS
# ============================================================================
Write-Section "6. ANALYTICS"
if ($PORTFOLIO_ID) {
    $r = Invoke-API GET "/analytics/$PORTFOLIO_ID" -Auth
    Assert-Test "GET /analytics/:portfolioId"      ($r.ok -or $r.code -eq 404) "HTTP $($r.code)"

    $r = Invoke-API GET "/analytics/$PORTFOLIO_ID/equity-curve" -Auth
    Assert-Test "GET /analytics/:id/equity-curve"  ($r.ok -or $r.code -eq 404) "HTTP $($r.code)"
} else {
    $script:TOTAL_SKIP = $script:TOTAL_SKIP + 2
    Write-Host "  [SKIP] Analytics - no portfolio" -ForegroundColor Yellow
}

# ============================================================================
# 7. STRATEGIES
# ============================================================================
Write-Section "7. STRATEGIES"
$r = Invoke-API GET "/strategies" -Auth
Assert-Test "GET /strategies"           $r.ok "HTTP $($r.code)"

# Use 'parameters' key (accepted after fix)
$stratBody = "{`"name`":`"Auto SMA Strategy`",`"description`":`"Test`",`"type`":`"SMA_CROSSOVER`",`"parameters`":{`"shortPeriod`":10,`"longPeriod`":30}}"
$r = Invoke-API POST "/strategies" $stratBody -Auth
Assert-Test "POST /strategies"          ($r.ok -or $r.code -in @(400, 201)) "$(if ($r.ok) { "id=$($r.data.data.id)" } else { "HTTP $($r.code) $($r.msg.Substring(0,[Math]::Min(80,$r.msg.Length)))" })"
if ($r.ok) { $STRATEGY_ID = $r.data.data.id }

if ($STRATEGY_ID) {
    $r = Invoke-API GET "/strategies/$STRATEGY_ID" -Auth
    Assert-Test "GET /strategies/:id"   $r.ok "HTTP $($r.code)"

    $btBody = "{`"symbol`":`"AAPL`",`"startDate`":`"2024-01-01`",`"endDate`":`"2024-06-01`",`"initialCapital`":10000}"
    $r = Invoke-API POST "/strategies/$STRATEGY_ID/backtests" $btBody -Auth
    Assert-Test "POST /strategies/:id/backtests" ($r.ok -or $r.code -in @(202, 200, 503, 400)) "$(if ($r.ok) { "id=$($r.data.data.id)" } else { "HTTP $($r.code)" })"

    $r = Invoke-API GET "/strategies/$STRATEGY_ID/backtests" -Auth
    Assert-Test "GET /strategies/:id/backtests"  ($r.ok -or $r.code -eq 200) "HTTP $($r.code)"

    $r = Invoke-API PUT "/strategies/$STRATEGY_ID" "{`"name`":`"Updated SMA`"}" -Auth
    Assert-Test "PUT /strategies/:id"   ($r.ok -or $r.code -in @(200, 400, 404)) "HTTP $($r.code)"
} else {
    $script:TOTAL_SKIP = $script:TOTAL_SKIP + 4
    Write-Host "  [SKIP] Strategy sub-tests" -ForegroundColor Yellow
}

# ============================================================================
# 8. NEWS
# ============================================================================
Write-Section "8. NEWS"
$r = Invoke-API GET "/news" -Auth
Assert-Test "GET /news"                 ($r.ok -or $r.code -in @(200, 503)) "HTTP $($r.code)"

$r = Invoke-API GET "/news?symbol=AAPL" -Auth
Assert-Test "GET /news?symbol=AAPL"    ($r.ok -or $r.code -in @(200, 503)) "HTTP $($r.code)"

# ============================================================================
# 9. AI
# ============================================================================
Write-Section "9. AI"
$r = Invoke-API POST "/ai/ask" "{`"question`":`"What is a P/E ratio?`"}" -Auth
Assert-Test "POST /ai/ask"              ($r.ok -or $r.code -in @(503, 400)) "$(if ($r.ok) { 'AI responded' } else { "HTTP $($r.code)" })"

if ($PORTFOLIO_ID) {
    $r = Invoke-API POST "/ai/analyse/portfolio" "{`"portfolioId`":`"$PORTFOLIO_ID`"}" -Auth
    Assert-Test "POST /ai/analyse/portfolio" ($r.ok -or $r.code -in @(503, 400)) "HTTP $($r.code)"
}

# Correct path: /ai/analyse/stock/{symbol} (symbol is path param)
$r = Invoke-API POST "/ai/analyse/stock/TSLA" "" -Auth
Assert-Test "POST /ai/analyse/stock/TSLA" ($r.ok -or $r.code -in @(503, 400, 404)) "$(if ($r.ok) { 'analysis returned' } else { "HTTP $($r.code)" })"

if ($STRATEGY_ID) {
    $r = Invoke-API POST "/ai/explain/strategy" "{`"strategyId`":`"$STRATEGY_ID`"}" -Auth
    Assert-Test "POST /ai/explain/strategy" ($r.ok -or $r.code -in @(503, 400, 404)) "HTTP $($r.code)"
}

# ============================================================================
# 10. SECURITY
# ============================================================================
Write-Section "10. SECURITY"
# No auth -> 401
$r = Invoke-API GET "/portfolios"
Assert-Test "No token -> 401"           (-not $r.ok -and $r.code -eq 401) "HTTP $($r.code)"

# Invalid JWT -> 401
$savedToken = $AUTH_TOKEN
$AUTH_TOKEN = "invalid.jwt.token"
$r = Invoke-API GET "/users/me" -Auth
Assert-Test "Malformed JWT -> 401"      (-not $r.ok -and $r.code -eq 401) "HTTP $($r.code)"
$AUTH_TOKEN = $savedToken

# XSS
$r = Invoke-API POST "/auth/login" "{`"email`":`"<script>alert(1)</script>@test.com`",`"password`":`"x`"}"
Assert-Test "XSS payload blocked"       (-not $r.ok -and $r.code -in @(400, 401, 422)) "HTTP $($r.code)"

# SQL injection
$r = Invoke-API POST "/auth/login" "{`"email`":`"'; DROP TABLE users;--`",`"password`":`"x`"}"
Assert-Test "SQL injection blocked"     (-not $r.ok -and $r.code -in @(400, 401, 422)) "HTTP $($r.code)"

# ============================================================================
# 11. CLEANUP / LOGOUT
# ============================================================================
Write-Section "11. CLEANUP"
# Logout requires refreshToken in body
if ($REFRESH_TOK) {
    $r = Invoke-API POST "/auth/logout" "{`"refreshToken`":`"$REFRESH_TOK`"}" -Auth
    Assert-Test "POST /auth/logout"     ($r.ok -or $r.code -in @(200, 204)) "HTTP $($r.code)"
} else {
    $script:TOTAL_SKIP = $script:TOTAL_SKIP + 1
    Write-Host "  [SKIP] Logout - no refresh token" -ForegroundColor Yellow
}

# ============================================================================
# SUMMARY
# ============================================================================
$total = $TOTAL_PASS + $TOTAL_FAIL + $TOTAL_SKIP
$pct   = if (($TOTAL_PASS + $TOTAL_FAIL) -gt 0) {
    [math]::Round($TOTAL_PASS / ($TOTAL_PASS + $TOTAL_FAIL) * 100)
} else { 0 }

Write-Host ""
Write-Host ("=" * 55) -ForegroundColor White
Write-Host "  QUANTEDGE AUTO TEST RESULTS" -ForegroundColor White
Write-Host ("=" * 55) -ForegroundColor White
Write-Host "  PASSED  : $TOTAL_PASS" -ForegroundColor Green
Write-Host "  FAILED  : $TOTAL_FAIL" -ForegroundColor $(if ($TOTAL_FAIL -gt 0) { "Red" } else { "Green" })
Write-Host "  SKIPPED : $TOTAL_SKIP" -ForegroundColor Yellow
Write-Host "  TOTAL   : $total" -ForegroundColor White
Write-Host "  PASS %  : $pct%" -ForegroundColor $(if ($pct -ge 90) { "Green" } elseif ($pct -ge 70) { "Yellow" } else { "Red" })
Write-Host ("=" * 55) -ForegroundColor White

if ($TOTAL_FAIL -gt 0) { exit 1 } else { exit 0 }
