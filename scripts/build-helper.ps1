param(
  [string]$Python = $env:DSH_DROOL_WHALE_BUILD_PYTHON
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$entry = Join-Path $projectRoot 'runtime\helper.py'
$assets = Join-Path $projectRoot 'assets'
$output = Join-Path $projectRoot 'runtime\bin\win32-x64'
$work = Join-Path $projectRoot '.build\helper'
$projectPython = Join-Path $projectRoot '.build\python-env\Scripts\python.exe'

if (-not $Python) {
  $Python = if (Test-Path -LiteralPath $projectPython) { $projectPython } else { 'python' }
}

New-Item -ItemType Directory -Force -Path $output, $work | Out-Null

& $Python -c "import PyInstaller, PySide6; print(f'PyInstaller {PyInstaller.__version__}; PySide6 {PySide6.__version__}')"
if ($LASTEXITCODE -ne 0) {
  throw "The selected Python cannot import both PyInstaller and PySide6. Install requirements into the same interpreter or set DSH_DROOL_WHALE_BUILD_PYTHON. Selected: $Python"
}

$pythonExecutable = (& $Python -c "import sys; print(sys.executable)").Trim()
$pythonBase = (& $Python -c "import sys; print(sys.base_prefix)").Trim()
$safeBuildPath = @(
  (Split-Path -Parent $pythonExecutable)
  $pythonBase
  (Join-Path $pythonBase 'DLLs')
  (Join-Path $env:WINDIR 'System32')
  $env:WINDIR
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique

$originalPath = $env:Path
try {
  # PyInstaller scans PATH for transitive DLLs. Keep unrelated developer tools
  # from supplying incompatible ICU/OpenSSL/API-set binaries to the Qt bundle.
  $env:Path = $safeBuildPath -join ';'
  & $Python -m PyInstaller `
    --noconfirm `
    --clean `
    --onefile `
    --console `
    --name drool-whale-pet-helper `
    --distpath $output `
    --workpath $work `
    --specpath $work `
    --add-data "$assets;assets" `
    --paths (Join-Path $projectRoot 'runtime') `
    $entry
  $pyInstallerExitCode = $LASTEXITCODE
} finally {
  $env:Path = $originalPath
}

if ($pyInstallerExitCode -ne 0) {
  throw "PyInstaller failed with exit code $pyInstallerExitCode"
}

$executable = Join-Path $output 'drool-whale-pet-helper.exe'
& node (Join-Path $PSScriptRoot 'test-packaged-helper.mjs') --executable $executable
if ($LASTEXITCODE -ne 0) {
  throw "Packaged helper visual smoke test failed with exit code $LASTEXITCODE"
}

Write-Output $executable
