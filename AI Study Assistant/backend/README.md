# AI Study Assistant Backend

Backend API for the AI Study Assistant application built with FastAPI.

## Setup

1. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

## Local backend architecture

The API is usable in local development without external services:

- Uploaded files are saved under `UPLOAD_DIR` (`./uploads` by default).
- Application state is stored in `DATA_DIR/store.json` (`./data/store.json` by default).
- Documents are extracted, chunked, and queried with a lightweight lexical retrieval service.
- Summaries, quizzes, flashcards, chat history, and auth users persist through the JSON store.

This mirrors the production database resources from `database/schema.sql`, so the service layer can later be swapped to SQLAlchemy/Postgres and Chroma/FAISS without changing the frontend API contract.

## API Documentation

- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
