# Development Guide

## Project Setup

This guide covers the development setup and workflow for the AI Study Assistant project.

## Code Structure

### Backend

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration management
│   ├── routes/                 # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── documents.py        # Document management
│   │   ├── chat.py             # Chat/RAG endpoints
│   │   ├── quizzes.py          # Quiz endpoints
│   │   ├── flashcards.py       # Flashcard endpoints
│   │   └── summarizer.py       # Summarization endpoints
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── [service implementations]
│   ├── models/                 # SQLAlchemy ORM models
│   │   └── __init__.py
│   ├── schemas/                # Pydantic validation schemas
│   │   └── __init__.py
│   ├── rag/                    # RAG pipeline implementation
│   │   ├── __init__.py
│   │   └── pipeline.py
│   ├── embeddings/             # Embedding service
│   │   └── __init__.py
│   └── utils/                  # Utility functions
│       └── __init__.py
├── tests/                      # Unit and integration tests
├── requirements.txt            # Python dependencies
├── .env.example               # Example environment variables
├── Dockerfile                 # Docker configuration
└── README.md
```

### Frontend

```
frontend/
├── src/
│   ├── pages/                 # Next.js pages
│   │   ├── layout.tsx         # Root layout
│   │   └── index.tsx          # Home page
│   ├── components/            # React components
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── [other components]
│   ├── services/              # API client
│   │   └── api.ts
│   ├── hooks/                 # Custom React hooks
│   │   └── index.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   └── styles/                # Global styles
│       └── globals.css
├── public/                    # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── Dockerfile                 # Docker configuration
└── README.md
```

## Development Workflow

### 1. Backend Development

#### Adding a New Route

1. Create a new file in `backend/app/routes/`
2. Define FastAPI router with endpoints
3. Include in `app/main.py`

Example:

```python
# backend/app/routes/new_feature.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class NewFeatureRequest(BaseModel):
    data: str

@router.post("/new-endpoint")
async def new_endpoint(request: NewFeatureRequest):
    """New endpoint documentation"""
    return {"result": "success"}
```

```python
# backend/app/main.py
from app.routes import new_feature
app.include_router(new_feature.router, prefix="/api/new-feature", tags=["new-feature"])
```

#### Adding a New Service

1. Create service class in `backend/app/services/`
2. Implement business logic
3. Use in route handlers

#### Adding a New Model

1. Define SQLAlchemy model in `backend/app/models/__init__.py`
2. Create corresponding Pydantic schema in `backend/app/schemas/__init__.py`
3. Create database migration (if using Alembic)

### 2. Frontend Development

#### Adding a New Page

1. Create new file in `src/pages/`
2. Export default React component
3. Next.js automatically routes it

```typescript
// src/pages/new-page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
```

#### Adding a New Component

1. Create file in `src/components/`
2. Use TypeScript and follow React conventions
3. Import and use in pages

#### Adding a New Hook

1. Create/update `src/hooks/index.ts`
2. Export custom hook
3. Use in components with `useQuery`, `useMutation`, etc.

#### Adding API Integration

1. Add method to `src/services/api.ts`
2. Create hook in `src/hooks/index.ts` if needed
3. Use in components

## Testing

### Backend Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_auth.py
```

### Frontend Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run watch mode
npm test -- --watch
```

## Code Quality

### Backend

```bash
# Linting
flake8 app/

# Type checking
mypy app/

# Code formatting
black app/

# All checks
flake8 app/ && mypy app/ && black --check app/
```

### Frontend

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation
- `refactor/component-name` - Code refactoring

### Commit Messages

```
feat: add new feature
fix: resolve issue
docs: update documentation
refactor: restructure code
test: add tests
style: format code
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit regularly
3. Push to remote repository
4. Create pull request with description
5. Request code review
6. Address review comments
7. Merge to `main`

## Debugging

### Backend Debugging

#### Using Print Statements

```python
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Debug info: {variable}")
```

#### Using Python Debugger

```python
import pdb; pdb.set_trace()
```

#### Using FastAPI Debug Mode

```env
DEBUG=True
```

### Frontend Debugging

#### Using Console

```typescript
console.log("Debug info:", data);
console.error("Error:", error);
```

#### Using React DevTools

- Install React Developer Tools browser extension
- Inspect components in React tab

#### Using Next.js Debug

```bash
# Debug with Node inspector
node --inspect-brk ./node_modules/.bin/next dev
```

## Performance Optimization

### Backend

- Use database indexes
- Implement caching with Redis
- Optimize queries
- Use async/await
- Profile with Python profilers

### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- React.memo for expensive components

## Database Migrations

Using Alembic (when implemented):

```bash
# Create new migration
alembic revision --autogenerate -m "Add new column"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

### Backend (.env)

- Database credentials
- API keys (Google Gemini)
- JWT secret
- Redis URL
- Feature flags

### Frontend (.env.local)

- API base URL
- Public keys
- Analytics IDs

## Documentation

- Update README when adding new features
- Document complex algorithms
- Add docstrings to all functions
- Keep API documentation updated

## Common Issues

### Import Errors

- Check Python path
- Verify dependencies are installed
- Use absolute imports

### Database Connection

- Verify database is running
- Check DATABASE_URL
- Verify credentials

### API Connection

- Check backend is running
- Verify CORS configuration
- Check network tab in browser

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://python.langchain.com)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org)
- [React Documentation](https://react.dev)
