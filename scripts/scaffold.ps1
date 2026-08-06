[CmdletBinding()]
param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repositoryRoot

if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot "turbo.json"))) {
  throw "Run this script from the checked-in CCSA Zora repository."
}

$nodeVersionText = (& node --version).TrimStart("v")
$nodeVersion = [version]$nodeVersionText
$minimumNodeVersion = [version]"22.13.0"

if ($nodeVersion -lt $minimumNodeVersion) {
  throw "CCSA Zora requires Node.js 22.13.0 or newer. Found $nodeVersionText."
}

corepack enable
corepack prepare pnpm@10.11.1 --activate

if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot ".env.local"))) {
  Copy-Item -LiteralPath (Join-Path $repositoryRoot ".env.example") `
    -Destination (Join-Path $repositoryRoot ".env.local")
}

pnpm install
pnpm --filter @ccsa-zora/mobile exec expo install --check

if (-not $SkipValidation) {
  pnpm validate:structure
  pnpm typecheck
  pnpm test:api
  pnpm --filter @ccsa-zora/mobile exec expo export --platform android --output-dir dist-android
  pnpm --filter @ccsa-zora/mobile exec expo export --platform ios --output-dir dist-ios
  pnpm --filter @ccsa-zora/web build
}

Write-Host "CCSA Zora scaffold is ready."
