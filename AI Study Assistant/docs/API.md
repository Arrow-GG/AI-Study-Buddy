# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints (except login/register) require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Documents

#### Upload Document

```http
POST /documents/upload
Content-Type: multipart/form-data

file: <binary>
```

#### List Documents

```http
GET /documents/
```

#### Get Document

```http
GET /documents/{document_id}
```

#### Delete Document

```http
DELETE /documents/{document_id}
```

### Chat & RAG

#### Ask Question

```http
POST /chat/ask
Content-Type: application/json

{
  "message": "What is the process scheduling algorithm?",
  "document_id": 1,
  "conversation_history": []
}

Response:
{
  "response": "Based on your notes...",
  "sources": [
    {
      "content": "...",
      "metadata": {}
    }
  ],
  "confidence": 0.85
}
```

#### Get Chat History

```http
GET /chat/history/{document_id}
```

#### WebSocket Chat

```
WS /chat/ws/{document_id}
```

### Quizzes

#### Generate Quiz

```http
POST /quizzes/generate
Content-Type: application/json

{
  "document_id": 1,
  "num_questions": 10,
  "question_type": "mcq"
}
```

#### Get Quiz

```http
GET /quizzes/{quiz_id}
```

#### Submit Quiz

```http
POST /quizzes/{quiz_id}/submit
Content-Type: application/json

{
  "answers": [
    {
      "question_id": 1,
      "user_answer": "A"
    }
  ]
}

Response:
{
  "id": 1,
  "score": 8,
  "total": 10,
  "percentage": 80.0,
  "answers": []
}
```

### Flashcards

#### Generate Flashcards

```http
POST /flashcards/generate
Content-Type: application/json

{
  "document_id": 1,
  "num_cards": 20
}
```

#### Get Flashcard Deck

```http
GET /flashcards/{deck_id}
```

#### Update Card Status

```http
PUT /flashcards/{card_id}/status
Content-Type: application/json

{
  "status": "mastered"  // "mastered" | "learning" | "difficult"
}
```

#### Get Next Card for Review

```http
GET /flashcards/{deck_id}/next
```

### Summarizer

#### Summarize Document

```http
POST /summarizer/summarize
Content-Type: application/json

{
  "document_id": 1,
  "summary_type": "brief"  // "brief" | "detailed" | "exam_focused"
}

Response:
{
  "one_liner": "...",
  "key_concepts": ["...", "..."],
  "important_formulas": ["...", "..."],
  "exam_tips": ["...", "..."],
  "quick_revision": "..."
}
```

#### Generate Exam Notes

```http
POST /summarizer/exam-notes
Content-Type: application/json

{
  "document_id": 1
}
```

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

Rate limiting is applied to prevent abuse:

- Authentication endpoints: 5 requests per minute per IP
- General endpoints: 60 requests per minute per user
- File upload: 100 MB per hour per user

## Pagination

List endpoints support pagination:

```
GET /documents/?skip=0&limit=20
```

Query parameters:

- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 20, max: 100)

## Filtering

Supported filter parameters vary by endpoint:

```
GET /quizzes/document/{document_id}?sort=created_at&order=desc
```

## Response Format

All responses are in JSON format:

```json
{
  "data": {...},
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "request_id": "abc123"
  }
}
```

## Examples

### Complete Flow Example

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
# Save the access_token

# 3. Upload Document
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@notes.pdf"

# 4. Ask Question
curl -X POST http://localhost:8000/api/chat/ask \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the main topic?",
    "document_id": 1
  }'
```

For more details, visit the interactive API documentation at `/api/docs`
