#!/bin/bash
set -e

echo "→ Temporarily excluding API routes from static export..."
mv app/api _api_routes_tmp

cleanup() {
  echo "→ Restoring API routes..."
  mv _api_routes_tmp app/api 2>/dev/null || true
}
trap cleanup EXIT

echo "→ Building static export for Capacitor..."
BUILD_TARGET=capacitor \
  NEXT_PUBLIC_API_BASE=https://rida.architect-dna.ch \
  npx next build

echo "→ Syncing to Capacitor iOS platform..."
npx cap sync ios

echo "✓ iOS build ready — trigger Codemagic or open ios/App/App.xcworkspace in Xcode"
