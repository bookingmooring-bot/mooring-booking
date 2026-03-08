$basePath = "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\src\i18n\locales"

function Get-AllPaths {
    param($obj, $prefix = "")
    $paths = @()
    foreach ($prop in ($obj | Get-Member -MemberType NoteProperty).Name) {
        $fullKey = if ($prefix) { "$prefix.$prop" } else { $prop }
        $val = $obj.$prop
        if ($val -is [PSCustomObject]) {
            $paths += Get-AllPaths -obj $val -prefix $fullKey
        } else {
            $paths += $fullKey
        }
    }
    return $paths
}

$en = Get-Content (Join-Path $basePath "en.json") -Encoding UTF8 | ConvertFrom-Json
$enPaths = Get-AllPaths -obj $en

$results = @{}
foreach ($lang in @("de", "el", "fr", "it", "es", "tr")) {
    $filePath = Join-Path $basePath "$lang.json"
    $obj = Get-Content $filePath -Encoding UTF8 | ConvertFrom-Json
    $langPaths = Get-AllPaths -obj $obj
    $missing = $enPaths | Where-Object { $_ -notin $langPaths }
    $results[$lang] = $missing
    "$lang MISSING ($($missing.Count)):" | Out-File "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\locale_audit.txt" -Append
    $missing | ForEach-Object { "  $_" | Out-File "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\locale_audit.txt" -Append }
    "" | Out-File "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\locale_audit.txt" -Append
}
Write-Host "Done. Check locale_audit.txt"
