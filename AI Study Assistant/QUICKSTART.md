# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Docker & Docker Compose installed
- Google Gemini API key (free at https://ai.google.dev)

### Step 1: Clone & Setup

```bash
cd d:\Dev\Linux\AI Study Assistant

# Copy environment files
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

### Step 2: Configure Google API

```bash
# Edit backend/.env
GOOGLE_API_KEY=your-api-key-here
```

### Step 3: Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Wait 30 seconds for database to initialize
```

### Step 4: Access Application

```
Frontend:    http://localhost:3000
Backend:     http://localhost:8000
API Docs:    http://localhost:8000/api/docs
```

## 📁 Project Structure at a Glance

```
ai-study-assistant/
├── frontend/                 # Next.js + React + TypeScript
│   ├── src/
│   │   ├── pages/           # Application pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API client
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript definitions
│   │   └── styles/         # Global CSS + Tailwind
│   └── package.json         # Dependencies
│
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Data validation
│   │   ├── rag/            # RAG pipeline
│   │   ├── embeddings/     # Embedding service
│   │   └── utils/          # Utilities
│   └── requirements.txt     # Dependencies
│
├── database/
│   └── schema.sql          # PostgreSQL schema
│
├── docs/
│   ├── SETUP.md            # Installation guide
│   ├── API.md              # API documentation
│   ├── ARCHITECTURE.md     # System design
│   ├── DATABASE.md         # Database schema
│   ├── DEVELOPMENT.md      # Development guide
│   ├── ROADMAP.md          # Implementation plan
│   └── DEPLOYMENT.md       # Deployment options
│
├── docker-compose.yml      # Orchestration
├── README.md               # Project overview
└── .env.example            # Configuration template
```

## 🎯 Core Features

### ✅ Implemented (Ready to Use)

- Project structure and boilerplate
- API endpoints (routes defined)
- Database schema
- Frontend components framework
- Docker containerization
- Configuration management

### 📋 Need Implementation

- Document upload functionality
- Text extraction (PyPDF/pdfplumber)
- Embedding generation
- Vector search (Chroma)
- Quiz generation (LLM)
- Flashcard logic
- Chat interface

## 🛠️ Development Workflow

### Backend Development

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up .env
cp .env.example .env

# Run development server
uvicorn app.main:app --reload
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📚 Key Technologies

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | Next.js + React + TypeScript |
| Backend    | FastAPI + Python             |
| Database   | PostgreSQL                   |
| Cache      | Redis                        |
| Vector DB  | Chroma                       |
| LLM        | Google Gemini API            |
| AI Tools   | LangChain                    |
| Embeddings | Sentence Transformers        |
| Deployment | Docker + Docker Compose      |

## 🔑 Environment Variables

### Backend (.env)

- `GOOGLE_API_KEY` - Your Gemini API key
- `DATABASE_URL` - PostgreSQL connection
- `SECRET_KEY` - JWT signing key
- `REDIS_URL` - Redis connection
- `DEBUG` - Debug mode (True/False)

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL` - Backend API URL

## 📖 Documentation

- **[SETUP.md](docs/SETUP.md)** - Detailed installation instructions
- **[API.md](docs/API.md)** - Complete API reference
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and components
- **[DATABASE.md](docs/DATABASE.md)** - Database schema and queries
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guidelines
- **[ROADMAP.md](docs/ROADMAP.md)** - Implementation phases (16-week plan)
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment options (AWS, GCP, Heroku, etc.)

## 🐛 Troubleshooting

### Docker Issues

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Database Issues

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres

# View database
\l ai_study_assistant

# Exit
\q
```

### Port Conflicts

```bash
# Find process using port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

## 🎓 Learning Path

1. Review project structure
2. Study [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
3. Set up development environment
4. Explore API routes in `backend/app/routes/`
5. Understand RAG pipeline in `backend/app/rag/`
6. Check frontend components in `frontend/src/components/`
7. Review [ROADMAP.md](docs/ROADMAP.md) for implementation phases
8. Start implementing features from Phase 1

## 💡 Key Implementation Areas

### For RAG Implementation

- See `backend/app/rag/pipeline.py`
- Use `backend/app/embeddings/` for embeddings
- Check `backend/app/utils/` for text chunking

### For Document Processing

- Create service in `backend/app/services/`
- Add route in `backend/app/routes/documents.py`
- Store metadata in `document` and `document_chunks` tables

### For Frontend Pages

- Create `.tsx` files in `frontend/src/pages/`
- Use components from `frontend/src/components/`
- Call API via `frontend/src/services/api.ts`

## 🚀 Next Steps

1. **Set up environment** → Follow [SETUP.md](docs/SETUP.md)
2. **Configure API keys** → Get Google Gemini API key
3. **Start services** → `docker-compose up -d`
4. **Test endpoints** → Visit `http://localhost:8000/api/docs`
5. **Begin implementation** → Follow [ROADMAP.md](docs/ROADMAP.md)

## 📞 Support

- Check documentation in `docs/` folder
- Review code comments and docstrings
- Check GitHub issues for solutions
- Consult [DEVELOPMENT.md](docs/DEVELOPMENT.md) for guidelines

## ⭐ Project Highlights

✨ **Portfolio-Worthy Features:**

- RAG with semantic search
- LLM integration (Google Gemini)
- Vector embeddings (Sentence Transformers)
- Full-stack architecture
- Production-ready patterns
- Docker containerization
- Comprehensive documentation

🎯 **Perfect For:**

- M.Tech thesis/portfolio
- AI/ML interviews
- Startup MVP
- Research demonstration
- Learning full-stack AI development

---

**Ready to start?** Jump to [SETUP.md](docs/SETUP.md) →
