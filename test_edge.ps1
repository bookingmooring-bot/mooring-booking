$body = @{
    booking_id       = "3951b1f1-d519-46da-b599-22c62d5a5c52"
    old_status       = "confirmed"
    new_status       = "completed"
    guest_email      = "hernausa96@gmail.com"
    guest_name       = "Test Korisnik"
    check_in         = "2026-03-10"
    check_out        = "2026-03-13"
    total_price      = 150
    confirmation_code = "MB-D349D66E"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/on-booking-status-change" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing
    Write-Host "STATUS: $($response.StatusCode)"
    Write-Host "BODY: $($response.Content)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR STATUS: $statusCode"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "ERROR BODY: $errorBody"
}
