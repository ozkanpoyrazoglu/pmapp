#!/bin/bash

# quick-restart.sh - Backend hızlı restart script'i

echo "🔄 Backend yeniden başlatılıyor..."

# Backend container'ı durdur
docker-compose stop backend

# Backend'i yeniden başlat
docker-compose up -d backend

echo "⏳ Backend'in başlamasını bekliyor..."

# Backend'in hazır olmasını bekle
timeout=30
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ Backend başarıyla başlatıldı!"
        echo ""
        echo "🌐 API Health: http://localhost:8000/health"
        echo "📚 API Docs: http://localhost:8000/docs"
        echo ""
        echo "🧪 Login test:"
        echo "curl -X POST \"http://localhost:8000/api/auth/login\" \\"
        echo "  -H \"Content-Type: application/x-www-form-urlencoded\" \\"
        echo "  -d \"username=demo@example.com&password=demo123\""
        echo ""
        break
    fi
    
    if [ $((timeout % 5)) -eq 0 ]; then
        echo "⏳ Bekleniyor... (${timeout}s kaldı)"
    fi
    
    sleep 1
    timeout=$((timeout-1))
done

if [ $timeout -le 0 ]; then
    echo "❌ Backend başlatılamadı. Logları kontrol edin:"
    echo "docker-compose logs backend"
    exit 1
fi

echo "🎉 Backend hazır!"
