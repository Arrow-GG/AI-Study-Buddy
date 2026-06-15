# Architecture

## System Overview

The AI Study Assistant is a full-stack application that combines modern web technologies with AI/ML capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│              React + TypeScript + Tailwind CSS              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (FastAPI + Python)                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes Layer                       │   │
│  │  /auth /documents /chat /quizzes /flashcards ...   │   │
│  └────────────┬────────────────────────────────────────┘   │
│               │                                             │
│  ┌────────────▼────────────────────────────────────────┐   │
│  │            Services Layer                           │   │
│  │  DocumentService, ChatService, QuizService ...     │   │
│  └────────────┬────────────────────────────────────────┘   │
│               │                                             │
│  ┌────────────▼────────────────────────────────────────┐   │
│  │         RAG & AI Integration Layer                  │   │
│  │  • LangChain orchestration                          │   │
│  │  • Embedding generation                            │   │
│  │  • Vector search                                   │   │
│  │  • LLM integration (Google Gemini)                 │   │
│  └────────────┬────────────────────────────────────────┘   │
│               │                                             │
│  ┌────────────▼────────────────────────────────────────┐   │
│  │          Data Access Layer (SQLAlchemy)            │   │
│  │  Models, Schemas, Database operations              │   │
│  └────────────┬────────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────┘
                │
        ┌───────┴────────┬──────────────┬──────────────┐
        │                │              │              │
┌───────▼──────┐  ┌──────▼────┐  ┌────▼──────┐  ┌────▼──────┐
│  PostgreSQL  │  │   Redis   │  │  Chroma   │  │ Google    │
│  (Metadata)  │  │  (Cache)  │  │ (Vector)  │  │ Gemini    │
│              │  │           │  │           │  │ API       │
└──────────────┘  └───────────┘  └───────────┘  └───────────┘
```

## Component Details

### 1. Frontend (Next.js)

**Technology Stack:**

- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios

**Key Components:**

- **Pages**: Authentication, Dashboard, Document Viewer, Quiz, Flashcards
- **Components**: DocumentUpload, DocumentList, ChatInterface, QuizUI, FlashcardUI
- **Services**: API client with interceptors
- **Hooks**: Custom React hooks for data fetching and state management

**Features:**

- Server-side rendering (SSR)
- Static generation (SSG)
- API route abstraction
- Real-time chat via WebSocket

### 2. Backend (FastAPI)

**Technology Stack:**

- FastAPI (async Python framework)
- Pydantic (data validation)
- SQLAlchemy (ORM)
- Alembic (migrations)

**Directory Structure:**

```
backend/app/
├── main.py              # Application entry point
├── config.py            # Configuration management
├── routes/              # API endpoints
├── services/            # Business logic
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic validation schemas
├── rag/                 # RAG pipeline
├── embeddings/          # Embedding service
└── utils/               # Utility functions
```

**API Routes:**

- `auth.py` - Authentication (register, login, logout)
- `documents.py` - Document management (upload, list, delete)
- `chat.py` - RAG-based Q&A
- `quizzes.py` - Quiz generation and submission
- `flashcards.py` - Flashcard management
- `summarizer.py` - AI summarization

### 3. RAG Pipeline

**Flow:**

```
Document Upload
      ↓
Text Extraction (PyPDF, pdfplumber)
      ↓
Text Chunking (RecursiveCharacterTextSplitter)
      ↓
Embedding Generation (Sentence Transformers)
      ↓
Vector Storage (Chroma)
      ↓
Retrieval on Query
      ↓
Context-Aware LLM Response (Google Gemini)
      ↓
Response with Citations
```

**Key Classes:**

- `RAGPipeline`: Main orchestration class
- `EmbeddingService`: Embedding generation and management
- `TextSplitter`: Document chunking

### 4. Database Schema

**Core Tables:**

- `users` - User accounts and authentication
- `documents` - Uploaded documents metadata
- `document_chunks` - Text chunks with embedding references
- `quizzes` - Generated quizzes
- `questions` - Quiz questions
- `flashcard_decks` - Flashcard collections
- `flashcards` - Individual flashcards
- `chat_messages` - Chat history
- `quiz_responses` - Quiz submission records

### 5. Vector Database (Chroma)

**Purpose:**

- Store embeddings of document chunks
- Enable semantic search
- Support similarity queries

**Integration:**

- Persisted locally by default
- Can be extended to use other backends (Pinecone, Weaviate)

### 6. Caching (Redis)

**Use Cases:**

- Session management
- Query result caching
- Rate limiting
- Job queue for background tasks

### 7. LLM Integration (Google Gemini)

**Integration Points:**

- Document summarization
- Quiz generation
- Key concept extraction
- Question answering (in RAG pipeline)

**Implementation:**

- LangChain wrapper for API calls
- Prompt templates for consistency
- Token optimization

## Data Flow Diagrams

### Document Upload & Processing

```
User uploads file
        ↓
Validation (size, type)
        ↓
Store in filesystem
        ↓
Extract text (PyPDF/pdfplumber)
        ↓
Split into chunks
        ↓
Generate embeddings (Sentence Transformers)
        ↓
Store in Chroma
        ↓
Update document status to "completed"
        ↓
Notify frontend
```

### Question Answering (RAG)

```
User asks question
        ↓
Generate embedding for question
        ↓
Search Chroma for similar chunks
        ↓
Retrieve top-k results
        ↓
Build context from chunks
        ↓
Create prompt with context
        ↓
Call Google Gemini API
        ↓
Parse and format response
        ↓
Return with citations
```

### Quiz Generation

```
User requests quiz
        ↓
Retrieve document chunks
        ↓
Create LLM prompt with content
        ↓
Call Google Gemini API
        ↓
Parse response (extract questions)
        ↓
Validate and store in database
        ↓
Return quiz to frontend
```

## Deployment Architecture

### Docker Deployment

```
Docker Host
├── Frontend Container (Next.js)
├── Backend Container (FastAPI)
├── PostgreSQL Container
├── Redis Container
└── Chroma Volume (Persistent)
```

### Production Considerations

1. **Scaling**: Use Kubernetes for horizontal scaling
2. **Load Balancing**: Nginx or reverse proxy
3. **Monitoring**: Prometheus + Grafana
4. **Logging**: ELK Stack or cloud services
5. **Security**: HTTPS, API authentication, rate limiting
6. **Database**: RDS for managed PostgreSQL
7. **Cache**: ElastiCache for managed Redis
8. **Storage**: S3 or similar for file uploads

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (future)
3. **Input Validation**: Pydantic schemas
4. **Rate Limiting**: Per-user and per-IP limits
5. **CORS**: Configured for frontend domain
6. **Environment Variables**: Secrets management
7. **SQL Injection**: SQLAlchemy parameterized queries
8. **File Upload**: Validation and sandboxing

## Performance Optimization

1. **Caching**: Redis for frequently accessed data
2. **Database Indexing**: Indexes on frequently queried columns
3. **Vector Search**: Optimized Chroma queries
4. **Async Operations**: FastAPI async endpoints
5. **Pagination**: Limit result sets
6. **Query Optimization**: N+1 query prevention
7. **Frontend**: Code splitting and lazy loading

## Extension Points

The architecture supports easy extension:

1. **Add new routes**: Create new file in `routes/`
2. **Add new services**: Implement service class
3. **Add new models**: Define SQLAlchemy model
4. **Custom embeddings**: Implement `EmbeddingService` interface
5. **Alternative LLMs**: Update LLM configuration
6. **New features**: Follow the existing pattern
