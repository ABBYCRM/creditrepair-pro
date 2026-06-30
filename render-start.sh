#!/bin/bash
echo "=== Starting app ==="
echo "Node version: $(node --version)"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "PWD: $(pwd)"
echo "Dist contents:"
ls -la dist/ 2>&1
echo "=== Starting server ==="
exec node dist/boot.js
