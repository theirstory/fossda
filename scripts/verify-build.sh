#!/bin/bash

# Set NODE_ENV for the entire script
# Only use 'development', 'production', or 'test' for NODE_ENV
export NODE_ENV=production

# Use APP_ENV for any custom environment needs
export APP_ENV=${APP_ENV:-production}

# Run type checking
echo "Running type check..."
npm run typecheck

# Run production build
echo "Running production build..."
npm run build

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