#!/bin/bash

# Deposition Objection Automation Setup Script

echo "🚀 Setting up Deposition Objection Automation..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up Convex
echo "🔧 Setting up Convex..."
echo "⚠️  You need to run this interactively:"
echo "   npx convex dev"
echo ""
echo "   After running the command above, you'll get:"
echo "   - CONVEX_DEPLOYMENT"
echo "   - VITE_CONVEX_URL"
echo ""
echo "   Add these to your .env.local file"

# Check environment variables
echo "🔍 Checking environment variables..."
if [[ ! -f ".env.local" ]]; then
    echo "❌ .env.local file not found"
    exit 1
fi

# Check required env vars
required_vars=("VITE_CLERK_PUBLISHABLE_KEY" "CLERK_SECRET_KEY" "OPENAI_API_KEY" "POLAR_ACCESS_TOKEN")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ Environment variables look good!"

# Next steps
echo ""
echo "📋 Next steps:"
echo "1. Run: npx convex dev"
echo "2. Add the Convex variables to .env.local"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""
echo "🎉 Setup complete! Happy coding!"