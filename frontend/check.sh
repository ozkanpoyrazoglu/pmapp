#!/bin/bash

# build-check.sh - Build Environment Check Script

set -e

echo "🔍 Build Environment Check"
echo "========================="

# Function to check command existence
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo "✅ $1 is installed"
        $1 --version | head -n1
    else
        echo "❌ $1 is not installed"
        return 1
    fi
}

echo
echo "📋 System Requirements Check:"
echo "-----------------------------"

# Check Node.js
check_command node
echo

# Check npm
check_command npm
echo

# Check Docker (if using Docker)
if check_command docker; then
    echo
    check_command docker-compose
fi

echo
echo "📁 Project Structure Check:"
echo "---------------------------"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from frontend directory."
    exit 1
fi

echo "✅ package.json found"

# Check important files
files=("src/App.tsx" "src/index.tsx" "src/api/api.ts" "public/index.html")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo
echo "🔧 TypeScript Check:"
echo "-------------------"

# Check TypeScript compilation
if npm run type-check >/dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Running detailed TypeScript check..."
    npm run type-check
    exit 1
fi

echo
echo "📦 Dependencies Check:"
echo "---------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules missing. Running npm install..."
    npm install
fi

# Check for outdated packages
echo "Checking for major dependency issues..."
npm audit --audit-level high --production > /dev/null 2>&1 || echo "⚠️  Some dependency security issues found"

echo
echo "🏗️  Test Build:"
echo "---------------"

# Test if build works
echo "Running test build..."
if CI=true npm run build >/dev/null 2>&1; then
    echo "✅ Build test successful"
    echo "📁 Build output size:"
    if [ -d "build" ]; then
        du -sh build/
        echo "📄 Main files:"
        find build -name "*.js" -o -name "*.css" | head -5
    fi
else
    echo "❌ Build test failed"
    echo "Running detailed build..."
    CI=true npm run build
    exit 1
fi

echo
echo "🎉 All checks passed! Ready for deployment."
echo
echo "🚀 To build and run:"
echo "   npm run build"
echo "   npx serve -s build"
echo
echo "🐳 To build with Docker:"
echo "   docker build -t project-management-frontend ."
echo "   docker run -p 3000:80 project-management-frontend"