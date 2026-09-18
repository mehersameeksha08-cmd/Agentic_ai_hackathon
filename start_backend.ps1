$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}
if (-not $scriptDir) {
    $scriptDir = Get-Location
}

$backendDir = Join-Path $scriptDir "backend"
if (Test-Path $backendDir) {
    Set-Location $backendDir
}

$pythonExe = ".\venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

& $pythonExe -m uvicorn main:app --reload --port 8000
