#!/bin/sh
set -e

echo "=========================================="
echo "  Logistic - Local Development"
echo "=========================================="

# Wait for MongoDB to be ready
echo "[entrypoint] Waiting for MongoDB..."
until node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mahindra-builder')
    .then(() => { console.log('MongoDB is ready'); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
  echo "[entrypoint] MongoDB not ready, retrying in 2s..."
  sleep 2
done

# Run migrations/seed
echo "[entrypoint] Running migrations..."
npx ts-node --transpile-only scripts/seed.ts

# Start the server
echo "[entrypoint] Starting server..."
exec node dist/index.js
