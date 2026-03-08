$basePath = "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\src\i18n\locales"
$enPath = Join-Path $basePath "en.json"
$en = Get-Content $enPath -Encoding UTF8 | ConvertFrom-Json
$enKeys = ($en | Get-Member -MemberType NoteProperty).Name

foreach ($lang in @("de", "el", "fr", "it", "es", "tr")) {
    $filePath = Join-Path $basePath "$lang.json"
    $obj = Get-Content $filePath -Encoding UTF8 | ConvertFrom-Json
    $keys = ($obj | Get-Member -MemberType NoteProperty).Name
    $missing = $enKeys | Where-Object { $_ -notin $keys }
    Write-Host "=== $lang ==="
    if ($missing) {
        Write-Host "MISSING: $($missing -join ', ')"
    } else {
        Write-Host "OK - all top-level keys present"
    }
}
