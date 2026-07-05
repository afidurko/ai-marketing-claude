#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$PATH"

echo "Starting Heritage Slabs backend on :8000..."
cd "$ROOT/app/backend"
uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting Heritage Slabs frontend on :5173..."
cd "$ROOT/app/frontend"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000/docs"
echo "  CEO login: ceo@heritageslabs.com / heritage2026"
echo ""
wait
