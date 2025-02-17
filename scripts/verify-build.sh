#!/bin/bash

# Run type checking
echo "Running type check..."
npm run typecheck

# Run production build
echo "Running production build..."
NODE_ENV=production npm run build

# Run linting if you have ESLint configured
echo "Running linter..."
npm run lint

# Exit with error if any command failed
if [ $? -eq 0 ]; then
  echo "✅ Build verification passed"
  exit 0
else
  echo "❌ Build verification failed"
  exit 1
fi 