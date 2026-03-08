
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ2NzksImV4cCI6MjA4NzI4MDY3OX0.be7RrEhVEutbQDJqT1pl_OICFmFdkNRq3jFRCItecNQ"

Write-Host "=== TEST 1: Originalno pitanje 'vrijeme od splita do Visa?' ==="
$body = '{"messages":[{"role":"user","content":"vrijeme od splita do Visa?"}],"location":{"lat":43.508,"lng":16.439},"userProfile":{"tier":"basic"}}'
try {
    $result = Invoke-RestMethod `
        -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $ANON_KEY";"Content-Type"="application/json"} `
        -Body $body `
        -TimeoutSec 90
    Write-Host "STATUS: OK"
    Write-Host "REPLY ($($result.reply.Length) chars):"
    Write-Host $result.reply
} catch {
    Write-Host "ERROR: $_"
}

Write-Host ""
Write-Host "=== TEST 2: Navigacijsko pitanje ==="
$body2 = '{"messages":[{"role":"user","content":"Koliko traje putovanje brodom od Splita do Hvara?"}],"location":{"lat":43.508,"lng":16.439},"userProfile":{"tier":"basic"}}'
try {
    $result2 = Invoke-RestMethod `
        -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $ANON_KEY";"Content-Type"="application/json"} `
        -Body $body2 `
        -TimeoutSec 90
    Write-Host "STATUS: OK"
    Write-Host "REPLY ($($result2.reply.Length) chars):"
    Write-Host $result2.reply
} catch {
    Write-Host "ERROR: $_"
}
