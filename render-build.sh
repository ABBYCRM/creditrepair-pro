#!/bin/bash
set -e
echo "=== Starting build ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PWD: $(pwd)"
echo "=== Installing dependencies ==="
npm install 2>&1
echo "=== Running build ==="
npm run build 2>&1
echo "=== Build complete ==="
ls -la dist/ 2>&1
echo "=== dist/public contents ==="
ls -la dist/public/ 2>&1
