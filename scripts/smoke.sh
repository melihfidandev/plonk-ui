#!/usr/bin/env bash
# Gerçek kurulum testi: paketi pnpm ile .tgz'ye çıkarır, sıfır bir Vite projesine npm ile
# kurar (kullanıcı gibi), tip kontrolü + build yapar, derlenen CSS'i denetler.
# CI'da `package` işi çalıştırır; yerelde: bash scripts/smoke.sh (önce kütüphaneyi derle).
set -euo pipefail

ROOT="$(pwd)"
OUT="$ROOT/.release"
WORK="${RUNNER_TEMP:-$(mktemp -d)}/plonk-ui-smoke"

rm -rf "$OUT" "$WORK"
mkdir -p "$OUT"
pnpm --filter plonk-ui pack --pack-destination "$OUT"
TARBALL="$(ls "$OUT"/plonk-ui-*.tgz)"

cp -R "$ROOT/.github/smoke" "$WORK"
cd "$WORK"
npm install --no-audit --no-fund
npm install --no-audit --no-fund "$TARBALL"
npx tsc
npx vite build
node check.mjs
