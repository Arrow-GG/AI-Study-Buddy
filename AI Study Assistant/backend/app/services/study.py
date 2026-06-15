"""Study-material generation and lightweight retrieval."""

from __future__ import annotations

import re
from collections import Counter
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database import ChatMessage, FlashcardDeck, Quiz, QuizResponse, User, utcnow
from app.services.ai import generate_json, generate_text, semantic_search_chunks
from app.services.documents import all_document_text, document_chunks, get_document_or_404, normalize_id

STOPWORDS = {
    "about",
    "after",
    "also",
    "and",
    "are",
    "because",
    "been",
    "between",
    "but",
    "can",
    "from",
    "has",
    "have",
    "into",
    "its",
    "may",
    "not",
    "that",
    "the",
    "their",
    "then",
    "there",
    "these",
    "this",
    "those",
    "through",
    "when",
    "where",
    "which",
    "with",
    "your",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def tokenize(text: str) -> list[str]:
    return [
        token.lower()
        for token in re.findall(r"[A-Za-z][A-Za-z0-9_+-]{2,}", text)
        if token.lower() not in STOPWORDS
    ]


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if len(part.strip()) > 20]


def title_from_filename(filename: str) -> str:
    stem = re.sub(r"\.[^.]+$", "", filename)
    return re.sub(r"[-_]+", " ", stem).strip().title() or "Study Material"


def top_terms(text: str, limit: int = 8) -> list[str]:
    counts = Counter(tokenize(text))
    return [term for term, _ in counts.most_common(limit)]


def best_chunks(db: Session, user: User, document_id: int | str, query: str, limit: int = 4) -> list[dict]:
    semantic_matches = semantic_search_chunks(db, normalize_id(document_id), query, limit)
    if semantic_matches:
        return semantic_matches

    query_terms = Counter(tokenize(query))
    chunks = document_chunks(db, user, document_id)
    if not query_terms:
        return chunks[:limit]

    scored = []
    for chunk in chunks:
        terms = Counter(tokenize(chunk["content"]))
        score = sum(min(count, terms.get(term, 0)) for term, count in query_terms.items())
        score += 0.15 * sum(1 for term in query_terms if term in chunk["content"].lower())
        if score:
            scored.append((score, chunk))

    if not scored:
        return chunks[:limit]
    scored.sort(key=lambda item: item[0], reverse=True)
    return [chunk for _, chunk in scored[:limit]]


def answer_question(db: Session, user: User, document_id: int | str, message: str) -> dict:
    document = get_document_or_404(db, user, document_id)
    matches = best_chunks(db, user, document.id, message)
    if not matches:
        response = "I could not find readable content for that document yet. Try reprocessing it after upload."
        confidence = 0.0
    else:
        context = " ".join(chunk["content"] for chunk in matches)
        generated = generate_text(
            "You are an AI study assistant. Answer only from the provided notes. "
            "If the notes do not contain enough information, say that clearly. "
            "Keep the answer concise but useful for exam revision.\n\n"
            f"Notes:\n{context[:6000]}\n\nQuestion: {message}\n\nAnswer:"
        )
        if generated:
            response = generated
            confidence = min(0.97, 0.72 + 0.05 * len(matches))
        else:
            candidate_sentences = sentences(context)
            terms = set(tokenize(message))
            ranked = sorted(
                candidate_sentences,
                key=lambda sentence: sum(1 for term in terms if term in sentence.lower()),
                reverse=True,
            )
            selected = ranked[:3] if ranked else [context[:500]]
            response = " ".join(selected)
            if not response.endswith((".", "!", "?")):
                response += "."
            confidence = min(0.95, 0.45 + 0.1 * len(matches))

    sources = [
        {
            "content": chunk["content"][:700],
            "metadata": {
                **chunk.get("metadata", {}),
                "document_id": document.id,
                "filename": document.filename,
            },
        }
        for chunk in matches
    ]
    db.add(
        ChatMessage(
            document_id=document.id,
            user_id=user.id,
            role="user",
            content=message,
        )
    )
    db.add(
        ChatMessage(
            document_id=document.id,
            user_id=user.id,
            role="assistant",
            content=response,
            sources=sources,
        )
    )
    db.commit()
    return {"response": response, "sources": sources, "confidence": round(confidence, 2)}


def make_summary(db: Session, user: User, document_id: int | str) -> dict:
    document = get_document_or_404(db, user, document_id)
    text = all_document_text(db, user, document.id)
    generated = generate_json(
        "Create exam-focused study notes from this document. Use this exact JSON shape: "
        '{"one_liner": string, "key_concepts": string[], "important_formulas": string[], '
        '"exam_tips": string[], "quick_revision": string}. '
        "Keep arrays to 5-10 items and keep quick_revision under 1200 words.\n\n"
        f"Document text:\n{text[:12000]}"
    )
    if isinstance(generated, dict) and all(
        key in generated
        for key in ("one_liner", "key_concepts", "important_formulas", "exam_tips", "quick_revision")
    ):
        return {
            "one_liner": str(generated["one_liner"]),
            "key_concepts": [str(item) for item in generated.get("key_concepts", [])][:10],
            "important_formulas": [str(item) for item in generated.get("important_formulas", [])][:10],
            "exam_tips": [str(item) for item in generated.get("exam_tips", [])][:10],
            "quick_revision": str(generated["quick_revision"]),
        }

    terms = top_terms(text, 10)
    sent = sentences(text)
    lead = sent[0] if sent else text[:220]
    focused = sent[:5] or [text[:700]]
    formulas = extract_formulas(text)
    return {
        "one_liner": f"{title_from_filename(document.filename)}: {lead[:260]}",
        "key_concepts": [term.replace("_", " ").title() for term in terms[:8]],
        "important_formulas": formulas[:8],
        "exam_tips": [
            f"Be ready to define and compare {term.replace('_', ' ')}."
            for term in terms[:5]
        ],
        "quick_revision": " ".join(focused)[:1800],
    }


def extract_formulas(text: str) -> list[str]:
    patterns = [
        r"[A-Za-z][A-Za-z\s]{0,30}=\s*[^.;\n]{2,80}",
        r"\b[A-Z]\([^)]+\)\s*=\s*[^.;\n]{2,80}",
        r"\b\w+\s*=\s*[^.;\n]{2,80}",
    ]
    formulas: list[str] = []
    for pattern in patterns:
        formulas.extend(match.group(0).strip() for match in re.finditer(pattern, text))
    unique = []
    for formula in formulas:
        if formula not in unique and len(formula) < 120:
            unique.append(formula)
    return unique


def generate_exam_notes(db: Session, user: User, document_id: int | str) -> dict:
    summary = make_summary(db, user, document_id)
    return {
        "title": "Exam Notes",
        "sections": [
            {"heading": "Quick Revision", "content": summary["quick_revision"]},
            {"heading": "Key Concepts", "items": summary["key_concepts"]},
            {"heading": "Important Formulas", "items": summary["important_formulas"]},
            {"heading": "Likely Questions", "items": summary["exam_tips"]},
        ],
    }


def generate_quiz(db: Session, user: User, document_id: int | str, num_questions: int = 10, question_type: str = "mcq") -> dict:
    document = get_document_or_404(db, user, document_id)
    text = all_document_text(db, user, document.id)
    generated = generate_json(
        "Generate a quiz from these notes. Use this exact JSON shape: "
        '{"title": string, "questions": [{"type": "mcq", "question_text": string, "question": string, '
        '"options": string[], "correct_answer": string, "difficulty": "easy"|"medium"|"hard"}]}. '
        f"Generate {max(1, min(num_questions, 25))} questions. Options must include correct_answer.\n\n"
        f"Notes:\n{text[:12000]}"
    )
    if isinstance(generated, dict) and isinstance(generated.get("questions"), list):
        questions = []
        for index, question in enumerate(generated["questions"][: max(1, min(num_questions, 25))]):
            options = [str(option) for option in question.get("options", [])]
            correct_answer = str(question.get("correct_answer", options[0] if options else ""))
            if correct_answer and correct_answer not in options:
                options.append(correct_answer)
            questions.append(
                {
                    "id": index + 1,
                    "type": question.get("type", "mcq") if question.get("type") in {"mcq", "true_false", "fill_blank", "short_answer"} else "mcq",
                    "question_text": str(question.get("question_text") or question.get("question") or ""),
                    "question": str(question.get("question") or question.get("question_text") or ""),
                    "options": options[:6],
                    "correct_answer": correct_answer,
                    "difficulty": question.get("difficulty", "medium") if question.get("difficulty") in {"easy", "medium", "hard"} else "medium",
                }
            )
        if questions:
            quiz = Quiz(
                document_id=document.id,
                title=str(generated.get("title") or f"{title_from_filename(document.filename)} Quiz"),
                questions=questions,
                total_questions=len(questions),
            )
            db.add(quiz)
            db.commit()
            db.refresh(quiz)
            return serialize_quiz(quiz)

    terms = top_terms(text, max(num_questions * 2, 8))
    sent = sentences(text)
    if not terms:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No concepts found")

    allowed_types = {"mcq", "true_false", "fill_blank", "short_answer"}
    safe_question_type = question_type if question_type in allowed_types else "mcq"
    question_count = max(1, min(num_questions, len(terms)))
    questions = []
    for index, term in enumerate(terms[:question_count]):
        question_id = index + 1
        context = next((s for s in sent if term in s.lower()), sent[index % len(sent)] if sent else text[:160])
        distractors = [t.replace("_", " ").title() for t in terms if t != term][:3]
        while len(distractors) < 3:
            distractors.append(f"Related concept {len(distractors) + 1}")
        answer = term.replace("_", " ").title()
        options = distractors[:2] + [answer] + distractors[2:3]
        questions.append(
            {
                "id": question_id,
                "type": safe_question_type,
                "question_text": f"Which concept best matches this note: \"{context[:140]}\"?",
                "question": f"Which concept best matches this note: \"{context[:140]}\"?",
                "options": options,
                "correct_answer": answer,
                "difficulty": "medium" if index % 3 else "easy",
            }
        )

    quiz = Quiz(
        document_id=document.id,
        title=f"{title_from_filename(document.filename)} Quiz",
        questions=questions,
        total_questions=len(questions),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return serialize_quiz(quiz)


def serialize_quiz(quiz: Quiz) -> dict:
    return {
        "id": quiz.id,
        "document_id": quiz.document_id,
        "title": quiz.title,
        "questions": quiz.questions,
        "total_questions": quiz.total_questions,
        "created_at": quiz.created_at.isoformat(),
    }


def get_quiz_or_404(db: Session, user: User, quiz_id: int | str) -> Quiz:
    quiz = (
        db.query(Quiz)
        .join(Quiz.document)
        .filter(Quiz.id == normalize_id(quiz_id), Quiz.document.has(user_id=user.id))
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz


def submit_quiz(db: Session, user: User, quiz_id: int | str, answers: list[dict]) -> dict:
    quiz = get_quiz_or_404(db, user, quiz_id)
    correct_by_id = {str(question["id"]): question["correct_answer"] for question in quiz.questions}
    score = 0
    normalized_answers = []
    for answer in answers:
        question_id = str(answer.get("question_id"))
        user_answer = str(answer.get("answer", ""))
        is_correct = user_answer.strip().lower() == correct_by_id.get(question_id, "").strip().lower()
        score += int(is_correct)
        normalized_answers.append(
            {"question_id": int(question_id), "user_answer": user_answer, "is_correct": is_correct}
        )
    total = len(quiz.questions)
    result = QuizResponse(
        quiz_id=quiz.id,
        user_id=user.id,
        document_id=quiz.document_id,
        score=score,
        total=total,
        percentage=round((score / total) * 100, 2) if total else 0,
        answers=normalized_answers,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return {
        "id": result.id,
        "score": result.score,
        "total": result.total,
        "percentage": result.percentage,
        "answers": result.answers,
    }


def generate_flashcards(db: Session, user: User, document_id: int | str, num_cards: int = 20) -> dict:
    document = get_document_or_404(db, user, document_id)
    text = all_document_text(db, user, document.id)
    generated = generate_json(
        "Generate flashcards from these notes. Use this exact JSON shape: "
        '{"title": string, "cards": [{"front": string, "back": string}]}. '
        f"Generate {max(1, min(num_cards, 40))} cards. Make fronts recall prompts and backs concise explanations.\n\n"
        f"Notes:\n{text[:12000]}"
    )
    if isinstance(generated, dict) and isinstance(generated.get("cards"), list):
        cards = []
        for index, card in enumerate(generated["cards"][: max(1, min(num_cards, 40))]):
            front = str(card.get("front", "")).strip()
            back = str(card.get("back", "")).strip()
            if not front or not back:
                continue
            cards.append(
                {
                    "id": index + 1,
                    "front": front,
                    "back": back,
                    "status": "learning",
                    "review_count": 0,
                    "created_at": now_iso(),
                    "last_reviewed": None,
                }
            )
        if cards:
            deck = FlashcardDeck(
                document_id=document.id,
                title=str(generated.get("title") or f"{title_from_filename(document.filename)} Flashcards"),
                cards=cards,
                total_cards=len(cards),
            )
            db.add(deck)
            db.commit()
            db.refresh(deck)
            return serialize_deck(deck)

    terms = top_terms(text, max(num_cards, 8))
    sent = sentences(text)
    cards = []
    for index, term in enumerate(terms[: max(1, min(num_cards, len(terms)))]):
        context = next((s for s in sent if term in s.lower()), sent[index % len(sent)] if sent else text[:180])
        cards.append(
            {
                "id": index + 1,
                "front": f"What should you remember about {term.replace('_', ' ')}?",
                "back": context[:500],
                "status": "learning",
                "review_count": 0,
                "created_at": now_iso(),
                "last_reviewed": None,
            }
        )
    deck = FlashcardDeck(
        document_id=document.id,
        title=f"{title_from_filename(document.filename)} Flashcards",
        cards=cards,
        total_cards=len(cards),
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return serialize_deck(deck)


def serialize_deck(deck: FlashcardDeck) -> dict:
    return {
        "id": deck.id,
        "document_id": deck.document_id,
        "title": deck.title,
        "cards": deck.cards,
        "total_cards": deck.total_cards,
        "created_at": deck.created_at.isoformat(),
    }


def get_deck_or_404(db: Session, user: User, deck_id: int | str) -> FlashcardDeck:
    deck = (
        db.query(FlashcardDeck)
        .join(FlashcardDeck.document)
        .filter(FlashcardDeck.id == normalize_id(deck_id), FlashcardDeck.document.has(user_id=user.id))
        .first()
    )
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return deck


def update_card_status(db: Session, user: User, card_id: int | str, status_value: str) -> dict:
    card_id = normalize_id(card_id)
    decks = db.query(FlashcardDeck).join(FlashcardDeck.document).filter(FlashcardDeck.document.has(user_id=user.id)).all()
    for deck in decks:
        cards = list(deck.cards)
        for card in cards:
            if card["id"] == card_id:
                card["status"] = status_value
                card["review_count"] = int(card.get("review_count", 0)) + 1
                card["last_reviewed"] = now_iso()
                deck.cards = cards
                db.commit()
                return card
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")


def next_card(db: Session, user: User, deck_id: int | str) -> dict:
    deck = get_deck_or_404(db, user, deck_id)
    cards = sorted(
        deck.cards,
        key=lambda card: (
            card.get("status") == "mastered",
            card.get("review_count", 0),
            card.get("last_reviewed") or "",
        ),
    )
    if not cards:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cards to review")
    return cards[0]
