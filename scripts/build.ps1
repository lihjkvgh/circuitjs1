param([switch]$Offline)
$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $sourceRoot
. (Join-Path $PSScriptRoot 'setup-tools.ps1')
$oldJavaOptions = $env:JAVA_TOOL_OPTIONS
try {
  # Java/Git do not automatically inherit Windows' configured proxy.
  if (!$Offline) {
    $proxyUri = [System.Net.WebRequest]::DefaultWebProxy.GetProxy([uri]'https://services.gradle.org')
    if ($proxyUri.Host -ne 'services.gradle.org') {
      $env:JAVA_TOOL_OPTIONS = "$oldJavaOptions -Dhttps.proxyHost=$($proxyUri.Host) -Dhttps.proxyPort=$($proxyUri.Port) -Dhttp.proxyHost=$($proxyUri.Host) -Dhttp.proxyPort=$($proxyUri.Port)".Trim()
    }
  }
  $buildArgs = @('compileGwt', 'makeSite', '--console', 'plain', '--no-daemon')
  if ($Offline) { $buildArgs += '--offline' }
  & (Join-Path $sourceRoot 'gradlew.bat') @buildArgs
  if ($LASTEXITCODE -ne 0) { throw 'CircuitJS1 build failed' }
  & node (Join-Path $PSScriptRoot 'deploy.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'CircuitJS1 deployment failed' }
} finally { $env:JAVA_TOOL_OPTIONS = $oldJavaOptions }
