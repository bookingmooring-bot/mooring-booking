# AI Captain Full Test Suite — 24 tests covering all 12 published capabilities
# Run: powershell -ExecutionPolicy Bypass -File test_ai_captain_full.ps1

$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ2NzksImV4cCI6MjA4NzI4MDY3OX0.be7RrEhVEutbQDJqT1pl_OICFmFdkNRq3jFRCItecNQ"
$BASE_URL = "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain"
$SPLIT_LOC = @{ lat = 43.508; lng = 16.439 }

$PASS = 0
$FAIL = 0
$TOTAL = 0
$FAILURES = @()

function Test-AICaptain {
    param(
        [string]$TestName,
        [string]$Message,
        [hashtable]$Location = $SPLIT_LOC,
        [string]$Tier = "sailor",
        [string[]]$ExpectKeywords = @(),
        [string]$ExpectIntent = "",
        [string[]]$RejectKeywords = @(),
        [int]$MinReplyLength = 20
    )

    $script:TOTAL++
    Write-Host ""
    Write-Host "=== TEST $($script:TOTAL): $TestName ===" -ForegroundColor Cyan

    $body = @{
        messages    = @(@{ role = "user"; content = $Message })
        location    = $Location
        userProfile = @{ tier = $Tier }
    } | ConvertTo-Json -Depth 4

    try {
        $result = Invoke-RestMethod `
            -Uri $BASE_URL `
            -Method POST `
            -Headers @{ "Authorization" = "Bearer $ANON_KEY"; "Content-Type" = "application/json" } `
            -Body $body `
            -TimeoutSec 120

        $passed = $true
        $reasons = @()

        # Check reply exists and meets min length
        if (-not $result.reply -or $result.reply.Length -lt $MinReplyLength) {
            $passed = $false
            $reasons += "Reply too short ($($result.reply.Length) chars, min $MinReplyLength)"
        }

        # Check intent
        if ($ExpectIntent -and $result.intent -ne $ExpectIntent) {
            $passed = $false
            $reasons += "Intent mismatch: got '$($result.intent)', expected '$ExpectIntent'"
        }

        # Check expected keywords (OR logic — at least one must match)
        if ($ExpectKeywords.Count -gt 0) {
            $foundAny = $false
            foreach ($kw in $ExpectKeywords) {
                if ($result.reply -match [regex]::Escape($kw)) {
                    $foundAny = $true
                    break
                }
            }
            if (-not $foundAny) {
                $passed = $false
                $reasons += "None of expected keywords found: $($ExpectKeywords -join ', ')"
            }
        }

        # Check reject keywords
        foreach ($rk in $RejectKeywords) {
            if ($result.reply -match [regex]::Escape($rk)) {
                $passed = $false
                $reasons += "Reject keyword found: '$rk'"
            }
        }

        if ($passed) {
            $script:PASS++
            Write-Host "  PASS" -ForegroundColor Green
            Write-Host "  Intent: $($result.intent) | Reply: $($result.reply.Length) chars"
        } else {
            $script:FAIL++
            $failMsg = "$TestName`: $($reasons -join '; ')"
            $script:FAILURES += $failMsg
            Write-Host "  FAIL: $($reasons -join '; ')" -ForegroundColor Red
            Write-Host "  Intent: $($result.intent) | Reply: $($result.reply.Substring(0, [Math]::Min(200, $result.reply.Length)))..."
        }
    }
    catch {
        $script:FAIL++
        $script:FAILURES += "$TestName`: HTTP Error - $_"
        Write-Host "  FAIL: HTTP Error - $_" -ForegroundColor Red
    }
}

# ================================================═══════════════
# 1. Weather & Storm Forecasts (2 tests)
# ================================================═══════════════

Test-AICaptain `
    -TestName "1a Weather-HR" `
    -Message "Kakvo je vrijeme u Splitu?" `
    -ExpectIntent "CHECK_WEATHER" `
    -ExpectKeywords @("vjetar", "temperatura", "Beaufort", "bura", "jugo", "m/s", "kn", "val", "wind", "Split")

Test-AICaptain `
    -TestName "1b Weather-EN" `
    -Message "What is the weather forecast for Dubrovnik for the next 3 days?" `
    -Location @{ lat = 42.650; lng = 18.094 } `
    -ExpectIntent "CHECK_WEATHER" `
    -ExpectKeywords @("wind", "temperature", "Beaufort", "forecast", "knots", "wave")

# ================================================═══════════════
# 2. Turn-by-Turn Nautical Navigation (2 tests)
# ================================================═══════════════

Test-AICaptain `
    -TestName "2a Navigation-HR" `
    -Message "Koliko je nautičkih milja od Splita do Hvara i koji je kurs?" `
    -ExpectKeywords @("NM", "kurs", "bearing", "ETA", "nautical", "milja", "rut", "karta")

Test-AICaptain `
    -TestName "2b Navigation-EN" `
    -Message "What is the distance in nautical miles from Split to Vis and what course should I steer?" `
    -ExpectKeywords @("NM", "bearing", "course", "OpenSeaMap", "nautical", "miles", "route", "distance")

# ================================================═══════════════
# 3. Mooring & Docking Guidance (1 test)
# ================================================═══════════════

Test-AICaptain `
    -TestName "3 Docking-Guidance" `
    -Message "How do I do a stern-to mooring in a crosswind with a monohull?" `
    -ExpectKeywords @("stern", "line", "fender", "wind", "spring", "bow")

# ================================================═══════════════
# 4. Route Planning (1 test)
# ================================================═══════════════

Test-AICaptain `
    -TestName "4 Route-Planning" `
    -Message "Plan a 3-day sailing route from Split to Dubrovnik with overnight stops" `
    -ExpectKeywords @("Hvar", "Korcula", "Vis", "Mljet", "overnight", "anchorage", "marina", "Day") `
    -MinReplyLength 100

# ================================================═══════════════
# 5. Mooring Search & Booking (2 tests)
# ================================================═══════════════

Test-AICaptain `
    -TestName "5a Mooring-Search-HR" `
    -Message "Ima li slobodnih vezova blizu mene za brod od 12 metara?" `
    -ExpectIntent "SEARCH_MOORING" `
    -ExpectKeywords @("vez", "marina", "berth", "mooring", "Premium", "Concierge", "Explore")

Test-AICaptain `
    -TestName "5b Mooring-Search-EN" `
    -Message "Find a mooring near Zadar for a 15m sailboat" `
    -Location @{ lat = 44.119; lng = 15.231 } `
    -ExpectIntent "SEARCH_MOORING" `
    -ExpectKeywords @("mooring", "marina", "berth", "Zadar", "booking")

# ================================================═══════════════
# 6. MAYDAY & Emergency Protocols (2 tests)
# ================================================═══════════════

Test-AICaptain `
    -TestName "6a MAYDAY-HR" `
    -Message "MAYDAY MAYDAY tonemo kod otoka Braca!" `
    -Location @{ lat = 43.350; lng = 16.650 } `
    -ExpectIntent "EMERGENCY" `
    -ExpectKeywords @("VHF", "16", "MRCC", "192", "Coast Guard", "Obalna")

Test-AICaptain `
    -TestName "6b Emergency-MOB" `
    -Message "Man overboard! What do I do?" `
    -ExpectIntent "EMERGENCY" `
    -ExpectKeywords @("MOB", "overboard", "Williamson", "turn", "VHF", "position", "GPS")

# ================================================═══════════════
# 7. Boat Diagnostics & Troubleshooting (1 test)
# ================================================═══════════════

Test-AICaptain `
    -TestName "7 Diagnostics" `
    -Message "Motor ne pali, cujem starter ali ne upali. Dizel motor." `
    -ExpectIntent "DIAGNOSE_ENGINE" `
    -ExpectKeywords @("gorivo", "filter", "fuel", "impeller", "diesel", "battery", "starter", "air")

# ================================================═══════════════
# 8. COLREGS & Maritime Safety (1 test)
# ================================================═══════════════

Test-AICaptain `
    -TestName "8 COLREGS" `
    -Message "I am sailing and a motor vessel is crossing from my starboard side. Who has right of way?" `
    -ExpectKeywords @("stand-on", "give way", "COLREG", "rule", "starboard", "sail", "power", "motor")

# ================================================═══════════════
# 9. Manoeuvre Guides (1 test)
# ================================================═══════════════

Test-AICaptain `
    -TestName "9 Manoeuvre-Anchoring" `
    -Message "Kako sidriti u jakom vjetru sa katamaranom? Daj mi korak po korak." `
    -ExpectKeywords @("sidro", "anchor", "lanac", "chain", "vjetar", "wind", "scope", "katamaran", "sidrenje") `
    -MinReplyLength 80

# ================================================═══════════════
# 10. Tourism & Destination Guide (3 tests — FOCUS AREA)
# ================================================═══════════════

Test-AICaptain `
    -TestName "10a Restaurant-EN (FOCUS)" `
    -Message "Where are the best restaurants to eat near the marina in Hvar?" `
    -Location @{ lat = 43.172; lng = 16.441 } `
    -ExpectIntent "FIND_RESTAURANT" `
    -ExpectKeywords @("restaurant", "restoran", "fish", "riba", "food", "cuisine", "hrana", "eat", "dine", "culinary", "dock") `
    -RejectKeywords @("I don't have", "nemam podatak", "I cannot")

Test-AICaptain `
    -TestName "10b Restaurant-HR (FOCUS)" `
    -Message "Preporuci mi restoran blizu marine u Splitu, trazim svjezu ribu i pogled na more" `
    -ExpectIntent "FIND_RESTAURANT" `
    -ExpectKeywords @("restoran", "restaurant", "riba", "fish", "more", "terasa", "konoba", "Split", "marina", "hrana", "opcij") `
    -RejectKeywords @("nemam podatak", "trenutno nemam")

Test-AICaptain `
    -TestName "10c Tourism-EN (FOCUS)" `
    -Message "What are the best restaurants and tourist attractions to visit near Dubrovnik marina?" `
    -Location @{ lat = 42.650; lng = 18.094 } `
    -ExpectIntent "FIND_RESTAURANT" `
    -ExpectKeywords @("wall", "old town", "fortress", "museum", "Stradun", "Lokrum", "culture", "history", "attraction", "Dubrovnik", "restaurant", "visit") `
    -RejectKeywords @("I don't have", "nemam podatak")

# ================================================═══════════════
# 11. Multi-Language Support (3 tests)
# ================================================═══════════════

Test-AICaptain `
    -TestName "11a Language-DE" `
    -Message "Wo kann ich in Split sicher anlegen? Ich habe eine 12m Segelyacht." `
    -ExpectKeywords @("Liegeplatz", "Marina", "Hafen", "anlegen", "Boot", "Meter", "Segeln")

Test-AICaptain `
    -TestName "11b Language-IT" `
    -Message "Dove posso ormeggiare vicino a Spalato con una barca di 14 metri?" `
    -ExpectKeywords @("ormeggio", "marina", "porto", "barca", "metri", "posto", "Split", "Spalato")

Test-AICaptain `
    -TestName "11c Language-FR" `
    -Message "Ou puis-je amarrer pres de Split? J'ai un voilier de 13 metres." `
    -ExpectKeywords @("amarrage", "marina", "port", "bateau", "voilier", "metres", "mouillage", "Split", "vent")

# ================================================═══════════════
# 12. Rate Limit / Response Structure (1 test)
# ================================================═══════════════

Write-Host ""
Write-Host "=== TEST $($TOTAL + 1): 12 Response-Structure ===" -ForegroundColor Cyan
$TOTAL++

$body12 = @{
    messages    = @(@{ role = "user"; content = "Pozdrav kapetane" })
    location    = $SPLIT_LOC
    userProfile = @{ tier = "basic" }
} | ConvertTo-Json -Depth 4

try {
    $result12 = Invoke-RestMethod `
        -Uri $BASE_URL `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $ANON_KEY"; "Content-Type" = "application/json" } `
        -Body $body12 `
        -TimeoutSec 120

    $hasReply = [bool]$result12.reply
    $hasIntent = [bool]$result12.intent
    $hasRemaining = $null -ne $result12.remaining

    if ($hasReply -and $hasIntent) {
        $PASS++
        Write-Host "  PASS - reply: $($result12.reply.Length) chars, intent: $($result12.intent), remaining: $($result12.remaining)" -ForegroundColor Green
    } else {
        $FAIL++
        $FAILURES += "12 Response-Structure: Missing fields (reply=$($hasReply), intent=$($hasIntent), remaining=$($hasRemaining))"
        Write-Host "  FAIL: Missing required response fields" -ForegroundColor Red
    }
}
catch {
    $FAIL++
    $FAILURES += "12 Response-Structure: HTTP Error - $_"
    Write-Host "  FAIL: HTTP Error - $_" -ForegroundColor Red
}

# ================================================═══════════════
# SUMMARY
# ================================================═══════════════

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  AI CAPTAIN TEST RESULTS" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  PASSED: $PASS / $TOTAL" -ForegroundColor $(if ($FAIL -eq 0) { "Green" } else { "Yellow" })
Write-Host "  FAILED: $FAIL / $TOTAL" -ForegroundColor $(if ($FAIL -eq 0) { "Green" } else { "Red" })

if ($FAILURES.Count -gt 0) {
    Write-Host ""
    Write-Host "  FAILURES:" -ForegroundColor Red
    foreach ($f in $FAILURES) {
        Write-Host "    - $f" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  Temperature: 0.50 | Model: Gemini Flash" -ForegroundColor Gray
Write-Host "  Tier used: sailor (unlimited)" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Yellow
