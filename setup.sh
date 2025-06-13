#!/bin/bash

# Project Management Application Setup Script
# Bu script projeyi hızlı bir şekilde kurmak için kullanılır

set -e  # Exit on any error

echo "🚀 Project Management Application - Kurulum Başlatılıyor..."
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker kurulu değil. Lütfen Docker'ı kurun: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose kurulu değil. Lütfen Docker Compose'u kurun."
        exit 1
    fi
    
    print_success "Docker kurulu ✓"
}

# Check if Node.js is installed (for development)
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js kurulu: $NODE_VERSION"
    else
        print_warning "Node.js kurulu değil. Geliştirme için Node.js 18+ önerilir."
    fi
}

# Check if Python is installed (for development)
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python kurulu: $PYTHON_VERSION"
    else
        print_warning "Python kurulu değil. Backend geliştirme için Python 3.11+ önerilir."
    fi
}

# Create environment files
create_env_files() {
    print_info "Environment dosyaları oluşturuluyor..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
MONGODB_URL=mongodb://admin:admin123@mongodb:27017/project_management?authSource=admin
DATABASE_NAME=project_management
SECRET_KEY=your-super-secret-key-please-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Development Settings
DEBUG=true
LOG_LEVEL=info
EOF
        print_success "Backend .env dosyası oluşturuldu"
    else
        print_info "Backend .env dosyası zaten mevcut"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME="Project Manager"
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
EOF
        print_success "Frontend .env dosyası oluşturuldu"
    else
        print_info "Frontend .env dosyası zaten mevcut"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Gerekli dizinler oluşturuluyor..."
    
    mkdir -p backend/app/auth
    mkdir -p backend/app/projects
    mkdir -p backend/app/shared
    mkdir -p frontend/src/components/auth
    mkdir -p frontend/src/components/layout
    mkdir -p frontend/src/components/projects
    mkdir -p frontend/src/components/tasks
    mkdir -p frontend/src/components/ui
    mkdir -p frontend/src/contexts
    mkdir -p frontend/src/pages/auth
    mkdir -p frontend/src/types
    mkdir -p frontend/src/api
    mkdir -p frontend/src/utils
    mkdir -p frontend/src/constants
    
    print_success "Dizinler oluşturuldu"
}

# Install dependencies (if not using Docker)
install_dependencies() {
    read -p "Geliştirme bağımlılıklarını kurmak istiyor musunuz? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backend dependencies
        if command -v python3 &> /dev/null && command -v pip &> /dev/null; then
            print_info "Backend bağımlılıkları kuruluyor..."
            cd backend
            if [ ! -d "venv" ]; then
                python3 -m venv venv
                print_success "Python virtual environment oluşturuldu"
            fi
            source venv/bin/activate
            pip install -r requirements.txt
            print_success "Backend bağımlılıkları kuruldu"
            deactivate
            cd ..
        else
            print_warning "Python/pip bulunamadı, backend bağımlılıkları atlanıyor"
        fi
        
        # Frontend dependencies
        if command -v npm &> /dev/null; then
            print_info "Frontend bağımlılıkları kuruluyor..."
            cd frontend
            npm install
            print_success "Frontend bağımlılıkları kuruldu"
            cd ..
        else
            print_warning "npm bulunamadı, frontend bağımlılıkları atlanıyor"
        fi
    fi
}

# Start Docker services
start_docker_services() {
    print_info "Docker servisleri başlatılıyor..."
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml dosyası bulunamadı!"
        exit 1
    fi
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    print_info "Docker images build ediliyor (bu biraz zaman alabilir)..."
    docker-compose up --build -d
    
    print_success "Docker servisleri başlatıldı"
}

# Wait for services to be ready
wait_for_services() {
    print_info "Servislerin hazır olması bekleniyor..."
    
    # Wait for backend
    print_info "Backend servisinin hazır olması bekleniyor..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend servisi hazır"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend servisi başlatılamadı"
            docker-compose logs backend
            exit 1
        fi
        sleep 2
    done
    
    # Wait for frontend
    print_info "Frontend servisinin hazır olması bekleniyor..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Frontend servisi hazır"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "Frontend servisi henüz hazır değil, ama devam edebilirsiniz"
            break
        fi
        sleep 2
    done
}

# Display final information
show_final_info() {
    echo
    echo "============================================================="
    print_success "🎉 Kurulum tamamlandı!"
    echo "============================================================="
    echo
    print_info "Servis URL'leri:"
    echo "  📱 Frontend:    http://localhost:3000"
    echo "  🔧 Backend API: http://localhost:8000"
    echo "  📚 API Docs:    http://localhost:8000/docs"
    echo "  🗄️  MongoDB:     mongodb://localhost:27017"
    echo
    print_info "Demo hesabı:"
    echo "  📧 Email:       demo@example.com"
    echo "  🔑 Şifre:       demo123"
    echo
    print_info "Kullanışlı komutlar:"
    echo "  docker-compose logs -f          # Logları takip et"
    echo "  docker-compose down             # Servisleri durdur"
    echo "  docker-compose up -d            # Servisleri başlat"
    echo "  docker-compose restart          # Servisleri yeniden başlat"
    echo
    print_warning "Production kullanımı için:"
    echo "  - SECRET_KEY değiştirilmeli"
    echo "  - MongoDB şifresi güçlendirilmeli"
    echo "  - HTTPS kullanılmalı"
    echo
}

# Main execution
main() {
    echo "Sistem gereksinimleri kontrol ediliyor..."
    check_docker
    check_node
    check_python
    
    echo
    create_directories
    create_env_files
    
    echo
    read -p "Docker ile servisleri başlatmak istiyor musunuz? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_docker_services
        wait_for_services
        show_final_info
    else
        install_dependencies
        echo
        print_info "Manuel kurulum tamamlandı. Servisleri başlatmak için:"
        echo "  docker-compose up -d"
        echo
        print_info "Veya geliştirme modunda:"
        echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
        echo "  Frontend: cd frontend && npm start"
    fi
}

# Script başlangıcı
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Project Management Application Setup Script"
    echo
    echo "Kullanım:"
    echo "  ./setup.sh              # Normal kurulum"
    echo "  ./setup.sh --docker     # Sadece Docker ile kurulum"
    echo "  ./setup.sh --dev        # Sadece development dependencies"
    echo "  ./setup.sh --help       # Bu yardım mesajı"
    exit 0
elif [ "$1" = "--docker" ]; then
    check_docker
    create_directories
    create_env_files
    start_docker_services
    wait_for_services
    show_final_info
elif [ "$1" = "--dev" ]; then
    check_node
    check_python
    create_directories
    create_env_files
    install_dependencies
else
    main
fi