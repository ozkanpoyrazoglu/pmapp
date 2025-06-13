#!/bin/bash

# debug-password.sh - Şifre debug script'i

echo "🔍 Password Debug - Demo Kullanıcı Kontrolü"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
print_info "1. MongoDB Demo User Kontrolü"
echo "------------------------------"

# MongoDB'de demo user var mı kontrol et
demo_user=$(docker-compose exec -T mongodb mongosh --quiet --eval "
use project_management
db.users.findOne({email: 'demo@example.com'})
")

if echo "$demo_user" | grep -q "demo@example.com"; then
    print_success "Demo user bulundu"
    echo "User data:"
    echo "$demo_user" | head -10
else
    print_error "Demo user bulunamadı!"
    print_info "Demo user oluşturuluyor..."
    
    # Demo user oluştur
    docker-compose exec -T mongodb mongosh --eval "
    use project_management
    db.users.insertOne({
        email: 'demo@example.com',
        full_name: 'Demo User',
        hashed_password: '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6KlCB.SGNO',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    })
    "
    print_success "Demo user oluşturuldu"
fi

echo ""
print_info "2. Şifre Hash Kontrolü"
echo "----------------------"

# Hash'i MongoDB'den al
stored_hash=$(docker-compose exec -T mongodb mongosh --quiet --eval "
use project_management
print(db.users.findOne({email: 'demo@example.com'}).hashed_password)
")

echo "Stored hash: $stored_hash"

echo ""
print_info "3. Backend BCrypt Testi"
echo "-----------------------"

# Backend container'da şifre testi
print_info "Backend'de şifre doğrulama testi..."

docker-compose exec -T backend python -c "
import sys
sys.path.append('/app')

try:
    from app.auth.utils import verify_password
    
    test_password = 'demo123'
    stored_hash = '$stored_hash'
    
    print(f'Test Password: {test_password}')
    print(f'Stored Hash: {stored_hash[:20]}...')
    
    # Test password verification
    result = verify_password(test_password, stored_hash)
    print(f'Verification Result: {result}')
    
    if result:
        print('✅ Password verification SUCCESS')
    else:
        print('❌ Password verification FAILED')
        
        # Try different variations
        test_passwords = ['demo123', 'Demo123', 'DEMO123', 'demo 123']
        print()
        print('Testing variations:')
        for pwd in test_passwords:
            try_result = verify_password(pwd, stored_hash)
            print(f'  {pwd} -> {try_result}')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
"

echo ""
print_info "4. Direct Login API Test"
echo "------------------------"

# API login test
print_info "Direct API login test..."

response=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=demo@example.com&password=demo123")

echo "Login response:"
echo "$response"

if echo "$response" | grep -q "access_token"; then
    print_success "Login API başarılı!"
else
    print_error "Login API başarısız!"
fi

echo ""
print_info "5. Yeni Hash Oluştur ve Test Et"
echo "--------------------------------"

# Yeni hash oluştur ve test et
print_info "Fresh hash oluşturuluyor..."

fresh_test=$(docker-compose exec -T backend python -c "
import sys
sys.path.append('/app')

try:
    from app.auth.utils import get_password_hash, verify_password
    
    password = 'demo123'
    
    # Yeni hash oluştur
    fresh_hash = get_password_hash(password)
    print(f'Fresh Hash: {fresh_hash}')
    
    # Yeni hash'i test et
    fresh_verify = verify_password(password, fresh_hash)
    print(f'Fresh Hash Verification: {fresh_verify}')
    
    # Stored hash ile karşılaştır
    stored_hash = '$stored_hash'
    stored_verify = verify_password(password, stored_hash)
    print(f'Stored Hash Verification: {stored_verify}')
    
    print()
    print('=== Önerilen Çözüm ===')
    if fresh_verify and not stored_verify:
        print('✅ Yeni hash çalışıyor, stored hash güncellenmelidir')
        print(f'MongoDB update komutu:')
        print(f'db.users.updateOne(')
        print(f'  {{email: \"demo@example.com\"}},')  
        print(f'  {{\\$set: {{hashed_password: \"{fresh_hash}\"}}}})
    elif stored_verify:
        print('✅ Stored hash çalışıyor, başka bir sorun var')
    else:
        print('❌ Her iki hash de çalışmıyor, BCrypt sorunu var')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
")

echo "$fresh_test"

echo ""
print_info "6. Sonuç ve Öneriler"
echo "--------------------"

print_info "Debug tamamlandı. Yukarıdaki sonuçlara göre:"
print_info "1. Demo user var mı?"
print_info "2. Hash verification çalışıyor mu?"
print_info "3. API login neden başarısız?"
print_info "4. Fresh hash ile stored hash farkı var mı?"

echo ""
print_warning "Eğer stored hash çalışmıyorsa, fresh hash ile güncellemeyi deneyin"
echo ""