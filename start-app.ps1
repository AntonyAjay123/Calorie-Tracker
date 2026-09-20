<#
.SYNOPSIS
    Starts the Calorie Tracker (frontend + backend) via Docker Compose.
.DESCRIPTION
    Runs `docker compose up -d` using this repo's docker-compose.yml, regardless
    of the directory the script is invoked from. See CLAUDE.md's "Docker
    (optional, all-in-one)" section for what the containers actually run.
.PARAMETER Build
    Rebuild images before starting (needed after changing a Dockerfile or
    adding an npm/uv dependency). Without this, docker compose reuses the
    existing images, which is faster for a normal start.
.EXAMPLE
    ./start-app.ps1
.EXAMPLE
    ./start-app.ps1 -Build
#>
[CmdletBinding()]
param(
    [switch]$Build
)

$ErrorActionPreference = 'Stop'
$composeFile = Join-Path $PSScriptRoot 'docker-compose.yml'

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker doesn't seem to be running. Start Docker Desktop and try again."
    exit 1
}

Write-Host "Starting Calorie Tracker (frontend + backend)..." -ForegroundColor Cyan

if ($Build) {
    docker compose -f $composeFile up --build -d
} else {
    docker compose -f $composeFile up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "docker compose up failed (exit code $LASTEXITCODE). See the output above."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Calorie Tracker is starting (containers may take a few seconds to become ready):" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:8001"
Write-Host ""
Write-Host "View logs with: docker compose logs -f"
Write-Host "Stop with:      ./stop-app.ps1"
