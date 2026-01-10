$ExtensionPath = Resolve-Path ".\dist"
$UserDataDir = Join-Path $PWD "test-profile"

Write-Host "Launching Chrome with Extension loaded from: $ExtensionPath"
Write-Host "User Data Directory: $UserDataDir"

# Ensure dist exists
if (-not (Test-Path $ExtensionPath)) {
    Write-Error "dist directory not found. Please run 'npm run build' first."
    exit 1
}

# Cleanup previous test profile (optional, maybe too aggressive to delete every time, let's keep it to persist history)
# Remove-Item -Recurse -Force $UserDataDir -ErrorAction SilentlyContinue

Start-Process "chrome.exe" -ArgumentList "--load-extension=$ExtensionPath", "--user-data-dir=$UserDataDir", "--no-first-run"
