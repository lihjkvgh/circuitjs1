$ErrorActionPreference = 'Stop'
$toolsDir = Join-Path $env:LOCALAPPDATA 'CircuitJS-Tools'
$jdkDir = Join-Path $toolsDir 'jdk-17.0.20.1+1'
if (!(Test-Path -LiteralPath (Join-Path $jdkDir 'bin\javac.exe'))) {
  New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
  $zipName = 'OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip'
  $zipPath = Join-Path $toolsDir $zipName
  $expected = 'e53a79c3c3d86865bd7e787903884331068e71321714ffd44f145785affc7cb0'
  if (!(Test-Path -LiteralPath $zipPath)) {
    Write-Host 'Downloading pinned Eclipse Temurin JDK 17 (portable, no administrator access)...'
    Invoke-WebRequest "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/$zipName" -OutFile $zipPath
  }
  if ((Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'JDK SHA-256 mismatch. Remove the invalid ZIP and retry.' }
  Expand-Archive -LiteralPath $zipPath -DestinationPath $toolsDir -Force
}
$env:JAVA_HOME = $jdkDir
$env:PATH = (Join-Path $jdkDir 'bin') + ';' + $env:PATH
& (Join-Path $jdkDir 'bin\java.exe') -version
