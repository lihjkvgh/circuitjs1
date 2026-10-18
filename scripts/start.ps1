param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $sourceRoot
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if ($nodeCommand) { $nodePath = $nodeCommand.Source }
else { $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (!(Test-Path -LiteralPath $nodePath)) { throw 'Install Node.js 24 and retry.' }
$listenPort = if ($env:CIRCUITJS_PORT) { [int]$env:CIRCUITJS_PORT } else { 8088 }
$url = "http://127.0.0.1:$listenPort"
try {
  $health = Invoke-RestMethod "$url/health" -TimeoutSec 2
  if ($health.app -eq 'circuitjs-repair-local') { if (!$NoBrowser) { Start-Process $url }; exit 0 }
} catch { }
if (!(Test-Path -LiteralPath (Join-Path $sourceRoot 'site\circuitjs1\circuitjs1.nocache.js'))) { throw 'Run Build.cmd first (initial build needs network).' }
& $nodePath (Join-Path $PSScriptRoot 'deploy.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Deployment failed' }
$browserJob = if (!$NoBrowser) { Start-Job -ArgumentList $url -ScriptBlock {
  param($url)
  for ($i=0; $i -lt 40; $i++) {
    try { $health = Invoke-RestMethod "$url/health" -TimeoutSec 1; if ($health.app -eq 'circuitjs-repair-local') { Start-Process $url; return } } catch { }
    Start-Sleep -Milliseconds 250
  }
} } else { $null }
try { & $nodePath (Join-Path $PSScriptRoot 'serve.mjs') }
finally { if ($browserJob) { Stop-Job $browserJob -ErrorAction SilentlyContinue; Remove-Job $browserJob -Force -ErrorAction SilentlyContinue } }
