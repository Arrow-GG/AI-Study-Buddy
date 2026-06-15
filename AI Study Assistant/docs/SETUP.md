# Setup Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)
- Google Gemini API key

## Quick Start with Docker Compose

The easiest way to get started is using Docker Compose:

```bash
# 1. Clone/navigate to the project
cd ai-study-assistant

# 2. Create .env file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Edit .env with your Google API key
# Set GOOGLE_API_KEY in backend/.env

# 4. Build and run
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

## Manual Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (if applicable)
# alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

Backend API will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 3. Database Setup

#### Option A: Using Docker

```bash
docker run --name postgres-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_study_assistant \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

#### Option B: Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE ai_study_assistant;"

# Run schema
psql -U postgres -d ai_study_assistant -f database/schema.sql
```

### 4. Redis Setup

```bash
# Using Docker
docker run --name redis-cache \
  -p 6379:6379 \
  redis:7-alpine

# Or run locally (if installed)
redis-server
```

## Configuration

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:<strong-password>@localhost:5432/ai_study_assistant

# Redis
REDIS_URL=redis://localhost:6379/0

# Google Gemini API
GOOGLE_API_KEY=your-api-key-here

# Server
DEBUG=True
PORT=8000

# Security
SECRET_KEY=<long-random-secret>
ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000

# AI
GOOGLE_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-1.5-pro
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/api/health
# Expected response: {"status": "healthy", ...}
```

### 2. Access API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

### 3. Check Frontend

- Navigate to http://localhost:3000

## Troubleshooting

### Database Connection Error

- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env matches your setup
- Check database credentials

### Google API Error

- Verify GOOGLE_API_KEY is set correctly
- Check API quotas in Google Cloud Console

### Port Already in Use

```bash
# Find process using port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

### Redis Connection Error

- Ensure Redis is running
- Verify REDIS_URL in .env

## Next Steps

1. Review [API.md](./API.md) for API documentation
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. See [DATABASE.md](./DATABASE.md) for database schema details
