# Database Schema

## Entity Relationship Diagram

```
Users (1) ──── (M) Documents
  │                    │
  │                    ├─ (M) DocumentChunks
  │                    ├─ (M) Quizzes
  │                    │        └─ (M) Questions
  │                    ├─ (M) FlashcardDecks
  │                    │        └─ (M) Flashcards
  │                    └─ (M) ChatMessages
  │
  └──── (M) ChatMessages
```

## Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

**Fields:**

- `id`: Primary key, auto-increment
- `name`: User's full name
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### documents

Metadata for uploaded study materials.

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL FOREIGN KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key to users
- `filename`: Original filename
- `file_path`: Path to stored file
- `file_size`: Size in bytes
- `mime_type`: MIME type (application/pdf, etc.)
- `status`: Processing status (processing, completed, failed)
- `upload_date`: When document was uploaded
- `processed_date`: When processing completed

**Status Values:**

- `processing`: Currently being processed
- `completed`: Successfully processed
- `failed`: Processing failed

### document_chunks

Text chunks of documents with embedding references.

```sql
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL FOREIGN KEY,
    content LONGTEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id)
);
```

**Fields:**

- `id`: Primary key
- `document_id`: Foreign key to documents
- `content`: The text chunk
- `chunk_index`: Order of chunk in document
- `embedding_id`: Reference to Chroma vector ID
- `created_at`: Creation timestamp

### quizzes

Generated quiz collections.

```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL FOREIGN KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id)
);
```

**Fields:**

- `id`: Primary key
- `document_id`: Foreign key to documents
- `title`: Quiz title
- `created_at`: Creation timestamp

### questions

Individual quiz questions.

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL FOREIGN KEY,
    type VARCHAR(50) NOT NULL,
    question_text LONGTEXT NOT NULL,
    options LONGTEXT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'medium',
    INDEX idx_quiz_id (quiz_id)
);
```

**Fields:**

- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `type`: Question type (mcq, true_false, fill_blank, short_answer)
- `question_text`: The question
- `options`: JSON array of options (for MCQ/true-false)
- `correct_answer`: Correct answer
- `difficulty`: Difficulty level (easy, medium, hard)

### flashcard_decks

Collections of flashcards.

```sql
CREATE TABLE flashcard_decks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL FOREIGN KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id)
);
```

**Fields:**

- `id`: Primary key
- `document_id`: Foreign key to documents
- `title`: Deck title
- `created_at`: Creation timestamp

### flashcards

Individual flashcard entries.

```sql
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER NOT NULL FOREIGN KEY,
    front VARCHAR(1000) NOT NULL,
    back VARCHAR(1000) NOT NULL,
    status VARCHAR(50) DEFAULT 'learning',
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP NULL,
    INDEX idx_deck_id (deck_id),
    INDEX idx_status (status)
);
```

**Fields:**

- `id`: Primary key
- `deck_id`: Foreign key to flashcard_decks
- `front`: Front side (question/prompt)
- `back`: Back side (answer/definition)
- `status`: Mastery status (mastered, learning, difficult)
- `review_count`: Number of times reviewed
- `created_at`: Creation timestamp
- `last_reviewed`: Last review timestamp

**Status Values:**

- `mastered`: Card is memorized
- `learning`: Currently learning
- `difficult`: Needs more practice

### chat_messages

Chat conversation history.

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL FOREIGN KEY,
    user_id INTEGER NOT NULL FOREIGN KEY,
    role VARCHAR(50) NOT NULL,
    content LONGTEXT NOT NULL,
    sources LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

**Fields:**

- `id`: Primary key
- `document_id`: Foreign key to documents
- `user_id`: Foreign key to users
- `role`: Message sender (user, assistant)
- `content`: Message text
- `sources`: JSON array of source references
- `created_at`: Message timestamp

### quiz_responses

User's quiz submission records.

```sql
CREATE TABLE quiz_responses (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL FOREIGN KEY,
    user_id INTEGER NOT NULL FOREIGN KEY,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    answers LONGTEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_user_id (user_id)
);
```

**Fields:**

- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `user_id`: Foreign key to users
- `score`: Number of correct answers
- `total`: Total number of questions
- `answers`: JSON array of user's answers
- `submitted_at`: Submission timestamp

## Indexing Strategy

**Primary Indexes:**

- All primary keys
- Foreign keys (user_id, document_id, etc.)

**Secondary Indexes:**

- `users.email` - For login queries
- `documents.user_id` - List user's documents
- `documents.status` - Filter by processing status
- `document_chunks.document_id` - Retrieve chunks
- `flashcards.status` - Spaced repetition queries
- `chat_messages.created_at` - Sort by date

## Query Patterns

### Get User's Documents

```sql
SELECT * FROM documents WHERE user_id = ? ORDER BY upload_date DESC;
```

### Get Document Chunks for RAG

```sql
SELECT content FROM document_chunks
WHERE document_id = ?
ORDER BY chunk_index;
```

### Get Flashcard Review Queue

```sql
SELECT * FROM flashcards
WHERE deck_id = ? AND status != 'mastered'
ORDER BY last_reviewed ASC, review_count ASC
LIMIT 20;
```

### Get Chat History

```sql
SELECT * FROM chat_messages
WHERE document_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

### Get Quiz Results

```sql
SELECT q.*, qr.score, qr.total
FROM quizzes q
LEFT JOIN quiz_responses qr ON q.id = qr.quiz_id
WHERE q.document_id = ?
ORDER BY q.created_at DESC;
```

## Backup & Recovery

**Recommended Backup Strategy:**

- Daily automated PostgreSQL dumps
- Point-in-time recovery enabled
- S3 backup storage
- Test recovery procedures regularly

**Backup Command:**

```bash
pg_dump -U postgres ai_study_assistant > backup_$(date +%Y%m%d).sql
```

## Performance Considerations

1. **Vector Embeddings**: Stored in Chroma, not PostgreSQL
2. **Large Text**: Use LONGTEXT for flexible field sizing
3. **Archival**: Implement data retention policies
4. **Partitioning**: Consider partitioning large tables (chat_messages, etc.)
5. **Statistics**: Regularly update table statistics for query optimizer

## Data Privacy

- User passwords: Bcrypt hashed
- Sensitive data: Should use database-level encryption
- GDPR: Implement right-to-deletion for user data
- Data retention: Define retention policies per table
