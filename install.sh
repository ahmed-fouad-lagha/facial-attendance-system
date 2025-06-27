#!/bin/bash

# Facial Attendance System - Installation Script
# This script automates the setup process for the facial attendance system

set -e  # Exit on any error

echo "🚀 Starting Facial Attendance System Installation..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
echo -e "\n${BLUE}📋 Checking Prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    print_success "Python found: $PYTHON_VERSION"
    PYTHON_CMD="python"
else
    print_error "Python is not installed. Please install Python 3.8+ from https://python.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm is not installed. Please install Node.js which includes npm."
    exit 1
fi

echo -e "\n${BLUE}📦 Installing Frontend Dependencies...${NC}"

# Install Node.js dependencies
print_status "Installing Node.js packages..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

echo -e "\n${BLUE}🐍 Setting Up Python Backend...${NC}"

# Create Python virtual environment
print_status "Creating Python virtual environment..."
cd deepfake-detection

if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."

if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

cd ..

echo -e "\n${BLUE}⚙️  Environment Configuration...${NC}"

# Create .env.local from template
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Environment file created from template"
        print_warning "Please update .env.local with your Supabase credentials"
    else
        print_warning "No .env.example found. Please create .env.local manually"
    fi
else
    print_warning ".env.local already exists"
fi

echo -e "\n${GREEN}✅ Installation Complete!${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Set up your Supabase project at https://supabase.com/"
echo "2. Update .env.local with your Supabase credentials"
echo "3. Run the database schema from supabase-schema.sql"
echo "4. Configure storage policies from supabase-storage-fix.sql"
echo ""
echo -e "${BLUE}🚀 To start the application:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "cd deepfake-detection"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "source venv/Scripts/activate"
else
    echo "source venv/bin/activate"
fi
echo "python main.py"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "npm run dev"
echo ""
echo -e "${BLUE}📱 Access the application:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
