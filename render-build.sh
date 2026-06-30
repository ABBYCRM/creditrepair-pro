#!/bin/bash
set -e
exec > >(tee /opt/render/build-output.log) 2>&1
echo "=== Starting build $(date) ==="
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "PWD: $(pwd)"
echo "Files: $(ls -la)"
echo "=== npm ci ==="
npm ci 2>&1
echo "=== npm run build ==="
npm run build 2>&1
echo "=== Build complete $(date) ==="
echo "Dist:"
ls -la dist/ 2>&1
echo "Dist/public:"
ls -la dist/public/ 2>&1
