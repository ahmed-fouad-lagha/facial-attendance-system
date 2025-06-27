#!/bin/bash

# Facial Attendance System - Startup Script
# Quick start script for running both services

echo "🚀 Starting Facial Attendance System..."
echo "======================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.example to .env.local and configure your Supabase credentials"
    exit 1
fi

echo "📱 Starting services..."

# Start backend in background
echo "🐍 Starting Python backend..."
cd deepfake-detection

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Python virtual environment not found!"
    echo "Please run ./install.sh first"
    exit 1
fi

# Activate virtual environment and start backend
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Starting FastAPI server on port 8000..."
python main.py &
BACKEND_PID=$!

cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting Next.js frontend..."
echo "Starting development server on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📱 Application URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
