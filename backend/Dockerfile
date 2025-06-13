# Backend Dockerfile

FROM python:3.11-slim

# Sistem bağımlılıklarını kur (bcrypt için gerekli)
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizini
WORKDIR /app

# Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Requirements'ı önce kopyala (Docker cache için)
COPY requirements.txt .

# Python paketlerini kur
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Health check script'i oluştur
RUN echo '#!/bin/bash\ncurl -f http://localhost:8000/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["/app/healthcheck.sh"]

# Non-root user oluştur
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]