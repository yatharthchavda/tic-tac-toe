# Setup script for Windows (PowerShell)

Write-Host "Setting up Tic-Tac-Toe Project..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Setup backend
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location server
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Cyan
    Copy-Item .env.example .env
}
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "SUCCESS: Backend setup complete" -ForegroundColor Green
Write-Host ""

# Setup frontend
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location ..\client
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Cyan
    Copy-Item .env.example .env
}
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "SUCCESS: Frontend setup complete" -ForegroundColor Green
Write-Host ""

# Return to root
Set-Location ..

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open TWO terminals" -ForegroundColor White
Write-Host "  2. Terminal 1: cd server && npm run dev" -ForegroundColor Yellow
Write-Host "  3. Terminal 2: cd client && npm run dev" -ForegroundColor Yellow
Write-Host "  4. Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "For more info, see QUICK_START.md" -ForegroundColor Cyan
