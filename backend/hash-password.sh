#!/bin/bash

# hash-password.sh - Şifre hashleme script'i

echo "🔐 Password Hasher Tool"
echo "======================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Function to hash password using backend
hash_password() {
    local password="$1"
    
    print_info "Password hashleniyor: '$password'"
    
    # Backend container'da hash oluştur
    hashed=$(docker-compose exec -T backend python -c "
import sys
sys.path.append('/app')

try:
    from app.auth.utils import get_password_hash, verify_password
    
    password = '$password'
    print('Input Password:', password)
    
    # Hash oluştur
    hashed = get_password_hash(password)
    print('Generated Hash:', hashed)
    
    # Verification test
    verify_result = verify_password(password, hashed)
    print('Verification Test:', verify_result)
    
    if verify_result:
        print('✅ Hash başarıyla oluşturuldu ve doğrulandı')
        print('HASH_RESULT:', hashed)
    else:
        print('❌ Hash doğrulama başarısız')
        
except Exception as e:
    print('❌ Error:', e)
    import traceback
    traceback.print_exc()
")

    echo "$hashed"
    
    # Hash'i çıkart
    hash_result=$(echo "$hashed" | grep "HASH_RESULT:" | cut -d' ' -f2)
    
    if [ ! -z "$hash_result" ]; then
        print_success "Hash başarıyla oluşturuldu!"
        echo ""
        echo "=== SONUÇ ==="
        echo "Password: $password"
        echo "Hash: $hash_result"
        echo ""
        echo "=== MongoDB UPDATE KOMUTU ==="
        echo "docker-compose exec mongodb mongosh --eval \""
        echo "use project_management"
        echo "db.users.updateOne("
        echo "  {email: 'demo@example.com'},"
        echo "  {\\\$set: {hashed_password: '$hash_result'}}"
        echo ")\""
        echo ""
        return 0
    else
        print_warning "Hash oluşturulamadı, manuel yöntemler deneyin"
        return 1
    fi
}

# Main script
main() {
    # Password parametresi kontrol et
    if [ $# -eq 1 ]; then
        password="$1"
    else
        echo "Hashlenmek istenen passwordü girin:"
        read -s password
        echo ""
    fi
    
    if [ -z "$password" ]; then
        echo "❌ Password boş olamaz!"
        exit 1
    fi
    
    # Backend container çalışıyor mu kontrol et
    if ! docker-compose ps backend | grep -q "Up"; then
        echo "❌ Backend container çalışmıyor!"
        echo "Önce 'docker-compose up -d backend' komutunu çalıştırın"
        exit 1
    fi
    
    # Hash oluştur
    hash_password "$password"
}

# Kullanım bilgisi
show_usage() {
    echo "Kullanım:"
    echo "  $0                    # İnteraktif mod"
    echo "  $0 'demo123'          # Direkt hash"
    echo ""
    echo "Örnekler:"
    echo "  $0 'demo123'          # demo123 şifresini hashle"
    echo "  $0 'yeniSifre2024'    # yeni şifre hashle"
    echo ""
    echo "Hash formatı: \$2b\$12\$... (BCrypt)"
}

# Parametre kontrolü
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
    exit 0
fi

# Ana fonksiyonu çalıştır
main "$@"