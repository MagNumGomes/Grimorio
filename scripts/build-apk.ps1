$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    & npm.cmd run icons
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar ícones.' }
    & npx.cmd expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o projeto Android.' }
    Push-Location (Join-Path $root 'android')
    try {
        # Release bundles JS/assets; the Expo template uses the local debug key.
        # Both ABIs cover modern physical phones and Android Studio emulators.
        & .\gradlew.bat assembleRelease '-PreactNativeArchitectures=arm64-v8a,x86_64' '--max-workers=2' '--console=plain'
        if ($LASTEXITCODE -ne 0) { throw 'Falha na compilação Android.' }
    } finally { Pop-Location }
    $output = Join-Path $root 'builds'
    New-Item -ItemType Directory -Force -Path $output | Out-Null
    $apk = Join-Path $output 'grimorio-1.0.0-preview.apk'
    Copy-Item (Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk') $apk -Force
    Get-FileHash $apk -Algorithm SHA256 | Format-List
    Write-Host "APK pronto: $apk"
} finally { Pop-Location }
