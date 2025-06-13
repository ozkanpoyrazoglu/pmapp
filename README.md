# Project Management Application

Microsoft Project benzeri, modern web tabanlı proje yönetimi uygulaması.

## 🚀 Özellikler

- **Proje Yönetimi**: Projeler oluşturun, düzenleyin ve takip edin
- **Task & Epic Yönetimi**: Detaylı görev takibi ve epic organizasyonu
- **Timeline Görünümü**: Gantt benzeri zaman çizelgesi
- **Kullanıcı Yönetimi**: JWT tabanlı güvenli authentication
- **Takım Collaboration**: Projeleri takım üyeleriyle paylaşın
- **Responsive Design**: Mobile-first, modern arayüz
- **Real-time Updates**: Dinamik veri güncellemeleri

## 🛠️ Teknoloji Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL veritabanı
- **Motor** - Async MongoDB driver
- **JWT** - Authentication & authorization
- **Pydantic** - Data validation
- **Docker** - Containerization

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Heroicons** - Icon library

## 📁 Proje Yapısı

```
project-management-app/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Ana uygulama
│   │   ├── database.py     # MongoDB bağlantısı
│   │   ├── auth/           # Authentication modülü
│   │   ├── projects/       # Project & Task modülleri
│   │   └── shared/         # Ortak utilities
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── types/          # TypeScript tip tanımları
│   │   └── api/            # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Multi-container setup
├── mongo-init.js          # MongoDB initialization
└── README.md
```

## 🚀 Hızlı Başlangıç

### Docker ile (Önerilen)

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/ozkanpoyrazoglu/pmapp.git
   cd project-management-app
   ```

2. **Environment dosyalarını oluşturun:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Uygulamayı başlatın:**
   ```bash
   docker-compose up -d
   ```

4. **Uygulamaya erişin:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manuel Kurulum

#### Backend Kurulumu

1. **Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **MongoDB'yi başlatın:**
   ```bash
   # Local MongoDB gerekli
   mongod
   ```

3. **Environment variables:**
   ```bash
   export MONGODB_URL="mongodb://localhost:27017/project_management"
   export SECRET_KEY="your-secret-key"
   ```

4. **Backend'i başlatın:**
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Kurulumu

1. **Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   ```

3. **Frontend'i başlatın:**
   ```bash
   npm start
   ```

## 🔐 Demo Hesabı

Uygulama demo hesabıyla gelir:

- **Email:** demo@example.com
- **Şifre:** demo123

## 📖 API Dokümantasyonu

Backend çalıştığında otomatik olarak Swagger UI üzerinden API dokümantasyonuna erişebilirsiniz:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🛠️ Geliştirme

### Backend Geliştirme

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Geliştirme

```bash
cd frontend
npm install
npm start
```

### Database Migration

MongoDB için migration script'leri `mongo-init.js` dosyasında bulunmaktadır.

## 🧪 Test

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Production Build

### Docker Production Build

```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manuel Production Build

#### Backend
```bash
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

#### Frontend
```bash
cd frontend
npm run build
# Build files: frontend/build/
```

## 🔧 Konfigürasyon

### Environment Variables

#### Backend (.env)
```env
MONGODB_URL=mongodb://mongodb:27017/project_management
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_NAME=project_management
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME="Project Manager"
```

## 🐳 Docker Commands

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Volume'ları da sil
docker-compose down -v

# Rebuild
docker-compose up --build
```

## 📝 Changelog

### v1.0.0
- İlk release
- Temel proje yönetimi özellikleri
- Authentication sistemi
- Timeline görünümü
- Responsive UI

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:

1. [Issues](https://github.com/ozkanpoyrazoglu/pmapp/issues) kısmından yeni bir issue açın
2. Mevcut issues'ları kontrol edin
3. [Discussions](https://github.com/ozkanpoyrazoglu/project-management-app/discussions) bölümünü kullanın

## 🙏 Teşekkürler

- [FastAPI](https://fastapi.tiangolo.com/) - Harika Python web framework
- [React](https://reactjs.org/) - Modern UI kütüphanesi
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) - NoSQL veritabanı

---

**Happy Coding!** 🚀