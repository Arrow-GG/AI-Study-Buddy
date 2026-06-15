/**
 * TypeScript types for the application
 */

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  file_size: number;
  status: "processing" | "completed" | "failed";
  upload_date: string;
  processed_date?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  sources: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
  confidence: number;
}

export interface Question {
  id: number;
  type: "mcq" | "true_false" | "fill_blank" | "short_answer";
  question_text: string;
  options?: string[];
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
  total_questions: number;
}

export interface QuizResponse {
  id: number;
  score: number;
  total: number;
  percentage: number;
  answers: Array<{
    question_id: number;
    user_answer: string;
  }>;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  status: "mastered" | "learning" | "difficult";
  review_count: number;
  created_at: string;
  last_reviewed?: string;
}

export interface FlashcardDeck {
  id: number;
  title: string;
  cards: Flashcard[];
  total_cards: number;
}

export interface Summary {
  one_liner: string;
  key_concepts: string[];
  important_formulas: string[];
  exam_tips: string[];
  quick_revision: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
