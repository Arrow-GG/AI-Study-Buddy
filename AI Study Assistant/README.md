# AI Study Assistant

An intelligent study companion that helps students learn more effectively through AI-powered summarization, quiz generation, flashcard creation, and conversational Q&A over uploaded study materials.

## 🎯 Project Overview

This M.Tech portfolio project combines cutting-edge AI technologies with practical learning tools:

- **RAG (Retrieval-Augmented Generation)**: Intelligent Q&A over uploaded documents
- **Embeddings & Vector Databases**: Semantic search across study materials
- **LLM Integration**: Google Gemini API for intelligent analysis
- **Document Processing**: Multi-format support (PDF, DOCX, TXT)
- **Study Analytics**: Track learning progress and weak areas

## 🏗️ Tech Stack

### Frontend

- **Next.js** - React framework with server-side rendering
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **React Query** - Data fetching and caching

### Backend

- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration and RAG pipeline
- **Chroma** - Vector database for embeddings
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation

### AI & ML

- **Google Gemini API** - LLM for summarization and Q&A
- **Sentence Transformers** - Embedding generation
- **PyPDF/pdfplumber** - PDF text extraction
- **python-docx** - DOCX file handling

### Infrastructure

- **PostgreSQL** - Relational database
- **Redis** - Caching layer
- **Docker** - Containerization
- **Vercel/Render** - Deployment platforms

## 📁 Project Structure

```
ai-study-assistant/
├── frontend/                 # Next.js React application
│   ├── components/          # Reusable React components
│   ├── pages/              # Next.js pages
│   ├── services/           # API client services
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles & Tailwind config
│   ├── types/              # TypeScript types
│   └── package.json
│
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── main.py        # Entry point
│   │   ├── config.py      # Configuration
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── dependencies/  # FastAPI dependencies
│   │   ├── utils/         # Utility functions
│   │   ├── rag/          # RAG pipeline
│   │   └── embeddings/   # Embedding generation
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── database/
│   ├── schema.sql         # Database schema
│   ├── migrations/        # Alembic migrations
│   └── seeds/            # Seed data
│
├── docs/
│   ├── API.md            # API documentation
│   ├── SETUP.md          # Setup guide
│   ├── ARCHITECTURE.md   # Architecture details
│   └── DATABASE.md       # Database schema
│
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

## 🚀 Core Features

### 1. Document Upload & Processing

- Support for PDF, DOCX, TXT files
- Optional OCR for scanned notes
- Automatic text extraction and chunking
- Semantic embedding generation

### 2. AI Summarizer

- One-line summaries
- Key concepts extraction
- Important formulas highlighting
- Exam-focused notes generation
- Quick revision versions

### 3. Quiz Generator

- MCQs with multiple choice options
- True/False questions
- Fill-in-the-blanks
- Short answer questions
- Configurable difficulty levels

### 4. Flashcard Generation

- Auto-generated revision cards
- Flip animation UI
- Progress tracking (mastered/learning/difficult)
- Spaced repetition scheduling

### 5. Chat with Notes (RAG)

- Conversational Q&A interface
- Context-aware answers from uploaded materials
- Semantic search across documents
- Citation of source materials

## 🎁 Extra Features

- **Voice Q&A**: Speech-to-text input with audio responses
- **Study Analytics**: Weak topic identification and score trends
- **Mind Maps**: Concept map generation from notes
- **Exam Mode**: Curated question sets and revision notes

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Google Gemini API key

### Quick Start

See [SETUP.md](docs/SETUP.md) for detailed instructions.

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)

## 🎓 Learning Outcomes

This project demonstrates:

- **NLP & RAG**: Building retrieval-augmented generation systems
- **Vector Databases**: Semantic search with embeddings
- **LLM Integration**: Prompt engineering and API usage
- **Full-Stack Development**: Frontend, backend, and database integration
- **AI Orchestration**: LangChain workflow management
- **Production Patterns**: Error handling, caching, async operations

## 📝 License

MIT License - Feel free to use this for your portfolio!

---

**Perfect for:** M.Tech portfolios, AI/ML interviews, startup MVP, research demonstrations
