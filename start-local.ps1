$projectRoot = $PSScriptRoot
$runtimePath = Join-Path $projectRoot '.local-runtime'
New-Item -ItemType Directory -Force -Path $runtimePath | Out-Null
$existing = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Output 'Port 4173 is already listening. Open http://localhost:4173'
    exit 0
}
$serverPath = Join-Path $projectRoot 'server.mjs'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$serverProcess = Start-Process -FilePath $nodePath -ArgumentList @($serverPath) -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath 'server.log') -RedirectStandardError (Join-Path $runtimePath 'server-error.log') -PassThru
$serverProcess.Id | Set-Content -LiteralPath (Join-Path $runtimePath 'server.pid')
Write-Output ('Started local server process ' + $serverProcess.Id)
Write-Output 'http://localhost:4173'
