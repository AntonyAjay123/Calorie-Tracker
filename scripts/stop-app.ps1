<#
.SYNOPSIS
    Stops the Calorie Tracker app started via start-app.ps1.
.DESCRIPTION
    Runs `docker compose down` using this repo's docker-compose.yml, regardless
    of the directory the script is invoked from.
.PARAMETER Volumes
    Also remove the node_modules/.venv named volumes (docker compose down -v),
    forcing a clean reinstall the next time the app starts.
.EXAMPLE
    ./scripts/stop-app.ps1
.EXAMPLE
    ./scripts/stop-app.ps1 -Volumes
#>
[CmdletBinding()]
param(
    [switch]$Volumes
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$composeFile = Join-Path $repoRoot 'docker-compose.yml'

Write-Host "Stopping Calorie Tracker..." -ForegroundColor Cyan

if ($Volumes) {
    docker compose -f $composeFile down -v
} else {
    docker compose -f $composeFile down
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "docker compose down failed (exit code $LASTEXITCODE). See the output above."
    exit $LASTEXITCODE
}

Write-Host "Calorie Tracker stopped." -ForegroundColor Green
